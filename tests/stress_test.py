#!/usr/bin/env python3
"""
Concurrency Stress Test Script for Payment Service
Simulates realistic frontend load patterns with concurrent requests.
"""

import asyncio
import aiohttp
import time
import json
import random
from typing import Dict, List, Optional
from dataclasses import dataclass, field
from datetime import datetime
import argparse
import sys

# Configuration
APP_URL = "https://nexus.tagiswild.rest"
API_BASE = f"{APP_URL}/api/v1/payments"

# Test data generators
def generate_customer_data(index: int) -> Dict:
    """Generate realistic customer data for testing."""
    names = ["John Doe", "Jane Smith", "Bob Johnson", "Alice Williams", "Charlie Brown"]
    domains = ["example.com", "test.com", "demo.org", "sample.net"]
    
    return {
        "name": f"{random.choice(names)} {index}",
        "email": f"testuser{index}@{random.choice(domains)}",
        "contact": f"{random.randint(9000000000, 9999999999)}"
    }

def generate_payment_init_request(index: int) -> Dict:
    """Generate a payment init request."""
    amounts = [10000, 25000, 50000, 75000, 100000]  # In paise
    descriptions = [
        "Premium Plan Subscription",
        "Product Purchase",
        "Service Fee",
        "Monthly Subscription",
        "One-time Payment"
    ]
    
    return {
        "amount": random.choice(amounts),
        "currency": "INR",
        "externalReferenceId": f"STRESS-TEST-{index}-{int(time.time())}",
        "description": f"{random.choice(descriptions)} - Test {index}",
        "customer": generate_customer_data(index)
    }

@dataclass
class TestResult:
    """Store results for a single request."""
    endpoint: str
    method: str
    status_code: int
    response_time: float
    success: bool
    error: Optional[str] = None
    order_id: Optional[str] = None

@dataclass
class TestStatistics:
    """Aggregate statistics for the test run."""
    total_requests: int = 0
    successful_requests: int = 0
    failed_requests: int = 0
    total_time: float = 0.0
    min_response_time: float = float('inf')
    max_response_time: float = 0.0
    avg_response_time: float = 0.0
    response_times: List[float] = field(default_factory=list)
    status_codes: Dict[int, int] = field(default_factory=dict)
    errors: List[str] = field(default_factory=list)
    order_ids: List[str] = field(default_factory=list)

class StressTester:
    """Main stress testing class."""
    
    def __init__(self, base_url: str, concurrent_users: int = 50, duration: int = 60, ramp_up: int = 10):
        self.base_url = base_url
        self.concurrent_users = concurrent_users
        self.duration = duration
        self.ramp_up = ramp_up  # Ramp-up period in seconds
        self.results: List[TestResult] = []
        self.statistics = TestStatistics()
        self.session: Optional[aiohttp.ClientSession] = None
        self.running = False
        self.error_count = 0
        self.max_errors_before_backoff = 10
        
    async def init_session(self):
        """Initialize aiohttp session."""
        timeout = aiohttp.ClientTimeout(total=30, connect=10)
        # Limit connections to prevent overwhelming the server
        max_connections = min(self.concurrent_users * 2, 100)
        self.session = aiohttp.ClientSession(
            timeout=timeout,
            connector=aiohttp.TCPConnector(
                limit=max_connections,
                limit_per_host=max_connections,
                ttl_dns_cache=300,
                force_close=False
            )
        )
    
    async def close_session(self):
        """Close aiohttp session."""
        if self.session:
            await self.session.close()
    
    async def test_health_check(self) -> TestResult:
        """Test the health check endpoint."""
        start_time = time.time()
        try:
            async with self.session.get(f"{self.base_url}/ping") as response:
                response_time = time.time() - start_time
                text = await response.text()
                return TestResult(
                    endpoint="/ping",
                    method="GET",
                    status_code=response.status,
                    response_time=response_time,
                    success=response.status == 200,
                    error=None if response.status == 200 else f"Status {response.status}: {text}"
                )
        except Exception as e:
            return TestResult(
                endpoint="/ping",
                method="GET",
                status_code=0,
                response_time=time.time() - start_time,
                success=False,
                error=str(e)
            )
    
    async def test_payment_init(self, index: int) -> TestResult:
        """Test payment initiation endpoint."""
        start_time = time.time()
        request_data = generate_payment_init_request(index)
        
        try:
            async with self.session.post(
                f"{API_BASE}/init",
                json=request_data,
                headers={"Content-Type": "application/json"}
            ) as response:
                response_time = time.time() - start_time
                response_data = await response.json() if response.content_type == 'application/json' else {}
                
                order_id = response_data.get("orderId") if isinstance(response_data, dict) else None
                
                result = TestResult(
                    endpoint="/api/v1/payments/init",
                    method="POST",
                    status_code=response.status,
                    response_time=response_time,
                    success=response.status == 200,
                    error=None if response.status == 200 else f"Status {response.status}",
                    order_id=order_id
                )
                
                if not result.success:
                    self.error_count += 1
                
                return result
        except Exception as e:
            self.error_count += 1
            return TestResult(
                endpoint="/api/v1/payments/init",
                method="POST",
                status_code=0,
                response_time=time.time() - start_time,
                success=False,
                error=str(e)
            )
    
    async def test_payment_status(self, order_id: str) -> TestResult:
        """Test payment status endpoint."""
        start_time = time.time()
        
        try:
            async with self.session.get(f"{API_BASE}/status/{order_id}") as response:
                response_time = time.time() - start_time
                return TestResult(
                    endpoint=f"/api/v1/payments/status/{order_id}",
                    method="GET",
                    status_code=response.status,
                    response_time=response_time,
                    success=response.status == 200,
                    error=None if response.status == 200 else f"Status {response.status}",
                    order_id=order_id
                )
        except Exception as e:
            return TestResult(
                endpoint=f"/api/v1/payments/status/{order_id}",
                method="GET",
                status_code=0,
                response_time=time.time() - start_time,
                success=False,
                error=str(e),
                order_id=order_id
            )
    
    async def simulate_user_session(self, user_id: int):
        """Simulate a complete user session (like frontend would do)."""
        session_results = []
        
        # Step 1: Health check (optional, but good to test)
        if random.random() < 0.1:  # 10% of users check health
            health_result = await self.test_health_check()
            session_results.append(health_result)
        
        # Step 2: Initiate payment (main action)
        init_result = await self.test_payment_init(user_id)
        session_results.append(init_result)
        
        # Step 3: If payment init succeeded, check status
        if init_result.success and init_result.order_id:
            # Wait a bit (simulating user interaction delay)
            await asyncio.sleep(random.uniform(0.1, 0.5))
            
            # Check status multiple times (like frontend polling)
            for _ in range(random.randint(1, 3)):
                status_result = await self.test_payment_status(init_result.order_id)
                session_results.append(status_result)
                await asyncio.sleep(random.uniform(0.2, 1.0))
        
        return session_results
    
    async def worker(self, worker_id: int, start_time: float):
        """Worker coroutine that runs user sessions until duration expires."""
        user_counter = worker_id
        worker_results = []
        elapsed = 0
        
        # Ramp-up: gradually increase load
        while elapsed < self.duration:
            current_time = time.time()
            elapsed = current_time - start_time
            
            # Ramp-up: start with fewer requests, gradually increase
            if elapsed < self.ramp_up:
                # During ramp-up, reduce frequency
                ramp_factor = elapsed / self.ramp_up
                base_delay = 0.5 / ramp_factor if ramp_factor > 0 else 0.5
            else:
                base_delay = 0.2
            
            try:
                # Exponential backoff if too many errors
                if self.error_count > self.max_errors_before_backoff:
                    backoff_delay = min(2.0, 0.1 * (2 ** (self.error_count // self.max_errors_before_backoff)))
                    await asyncio.sleep(backoff_delay)
                
                # Simulate user session
                session_results = await self.simulate_user_session(user_counter)
                worker_results.extend(session_results)
                
                # Adaptive delay based on error rate
                delay = base_delay
                if self.error_count > self.max_errors_before_backoff:
                    delay *= 2  # Slow down if errors are high
                
                await asyncio.sleep(random.uniform(delay, delay * 1.5))
                user_counter += self.concurrent_users
                
            except Exception as e:
                error_result = TestResult(
                    endpoint="worker_error",
                    method="ERROR",
                    status_code=0,
                    response_time=0.0,
                    success=False,
                    error=f"Worker {worker_id} error: {str(e)}"
                )
                worker_results.append(error_result)
                self.error_count += 1
                # Back off on errors
                await asyncio.sleep(random.uniform(0.5, 1.0))
        
        return worker_results
    
    async def run_stress_test(self):
        """Run the main stress test."""
        print(f"\n🚀 Starting Stress Test")
        print(f"   Target: {self.base_url}")
        print(f"   Concurrent Users: {self.concurrent_users}")
        print(f"   Duration: {self.duration} seconds")
        print(f"   Ramp-up Period: {self.ramp_up} seconds")
        print(f"   Start Time: {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}\n")
        
        if self.concurrent_users > 50:
            print("⚠️  WARNING: High concurrency detected. Consider starting with -u 10-20 for initial tests.")
            print("   The test will automatically back off if errors are detected.\n")
        
        await self.init_session()
        self.running = True
        start_time = time.time()
        
        try:
            # Create worker tasks
            tasks = [
                self.worker(worker_id, start_time)
                for worker_id in range(self.concurrent_users)
            ]
            
            # Run all workers concurrently
            all_results = await asyncio.gather(*tasks, return_exceptions=True)
            
            # Flatten results
            for result_set in all_results:
                if isinstance(result_set, list):
                    self.results.extend(result_set)
                elif isinstance(result_set, Exception):
                    error_result = TestResult(
                        endpoint="task_error",
                        method="ERROR",
                        status_code=0,
                        response_time=0.0,
                        success=False,
                        error=str(result_set)
                    )
                    self.results.append(error_result)
            
        finally:
            self.running = False
            await self.close_session()
        
        total_time = time.time() - start_time
        self.calculate_statistics(total_time)
    
    def calculate_statistics(self, total_time: float):
        """Calculate and store test statistics."""
        self.statistics.total_requests = len(self.results)
        self.statistics.total_time = total_time
        
        response_times = []
        for result in self.results:
            if result.success:
                self.statistics.successful_requests += 1
            else:
                self.statistics.failed_requests += 1
                if result.error:
                    self.statistics.errors.append(result.error)
            
            response_times.append(result.response_time)
            self.statistics.status_codes[result.status_code] = \
                self.statistics.status_codes.get(result.status_code, 0) + 1
            
            if result.order_id:
                self.statistics.order_ids.append(result.order_id)
        
        if response_times:
            self.statistics.response_times = response_times
            self.statistics.min_response_time = min(response_times)
            self.statistics.max_response_time = max(response_times)
            self.statistics.avg_response_time = sum(response_times) / len(response_times)
    
    def print_results(self):
        """Print test results in a formatted way."""
        print("\n" + "="*80)
        print("📊 STRESS TEST RESULTS")
        print("="*80)
        
        print(f"\n⏱️  Test Duration: {self.statistics.total_time:.2f} seconds")
        print(f"📈 Total Requests: {self.statistics.total_requests}")
        print(f"✅ Successful: {self.statistics.successful_requests} ({self.statistics.successful_requests/self.statistics.total_requests*100:.2f}%)")
        print(f"❌ Failed: {self.statistics.failed_requests} ({self.statistics.failed_requests/self.statistics.total_requests*100:.2f}%)")
        
        if self.statistics.response_times:
            print(f"\n⏱️  Response Times:")
            print(f"   Average: {self.statistics.avg_response_time*1000:.2f} ms")
            print(f"   Minimum: {self.statistics.min_response_time*1000:.2f} ms")
            print(f"   Maximum: {self.statistics.max_response_time*1000:.2f} ms")
            
            # Calculate percentiles
            sorted_times = sorted(self.statistics.response_times)
            p50 = sorted_times[len(sorted_times)//2] * 1000
            p95 = sorted_times[int(len(sorted_times)*0.95)] * 1000
            p99 = sorted_times[int(len(sorted_times)*0.99)] * 1000
            print(f"   P50 (Median): {p50:.2f} ms")
            print(f"   P95: {p95:.2f} ms")
            print(f"   P99: {p99:.2f} ms")
        
        print(f"\n📊 Requests per Second: {self.statistics.total_requests/self.statistics.total_time:.2f}")
        
        print(f"\n📋 Status Code Distribution:")
        for status_code, count in sorted(self.statistics.status_codes.items()):
            percentage = count / self.statistics.total_requests * 100
            print(f"   {status_code}: {count} ({percentage:.2f}%)")
        
        if self.statistics.order_ids:
            print(f"\n💳 Unique Orders Created: {len(set(self.statistics.order_ids))}")
        
        if self.statistics.errors:
            print(f"\n⚠️  Error Summary (showing first 10):")
            error_counts = {}
            for error in self.statistics.errors[:10]:
                error_key = error.split(':')[0] if ':' in error else error[:50]
                error_counts[error_key] = error_counts.get(error_key, 0) + 1
            
            for error, count in sorted(error_counts.items(), key=lambda x: x[1], reverse=True):
                print(f"   {error}: {count} occurrences")
        
        print("\n" + "="*80)
        
        # Endpoint breakdown
        endpoint_stats = {}
        for result in self.results:
            endpoint = result.endpoint.split('?')[0]  # Remove query params
            if endpoint not in endpoint_stats:
                endpoint_stats[endpoint] = {"total": 0, "success": 0, "times": []}
            endpoint_stats[endpoint]["total"] += 1
            if result.success:
                endpoint_stats[endpoint]["success"] += 1
            endpoint_stats[endpoint]["times"].append(result.response_time)
        
        print("\n📡 Endpoint Breakdown:")
        for endpoint, stats in sorted(endpoint_stats.items()):
            success_rate = stats["success"] / stats["total"] * 100
            avg_time = sum(stats["times"]) / len(stats["times"]) * 1000
            print(f"   {endpoint}")
            print(f"      Requests: {stats['total']}, Success: {stats['success']} ({success_rate:.1f}%)")
            print(f"      Avg Response Time: {avg_time:.2f} ms")
        
        print("\n" + "="*80 + "\n")

async def main():
    """Main entry point."""
    parser = argparse.ArgumentParser(
        description="Stress test the payment service API",
        formatter_class=argparse.RawDescriptionHelpFormatter,
        epilog="""
Examples:
  python stress_test.py                    # Default: 30 users, 60 seconds
  python stress_test.py -u 10 -d 30        # Start gentle: 10 users for 30 seconds
  python stress_test.py -u 50 -d 120       # 50 users for 2 minutes
  python stress_test.py -u 100 -d 60 -r 20  # 100 users, 20s ramp-up
        """
    )
    
    parser.add_argument(
        "-u", "--users",
        type=int,
        default=30,
        help="Number of concurrent users (default: 30, recommended: start with 10-20)"
    )
    
    parser.add_argument(
        "-d", "--duration",
        type=int,
        default=60,
        help="Test duration in seconds (default: 60)"
    )
    
    parser.add_argument(
        "-r", "--ramp-up",
        type=int,
        default=10,
        help="Ramp-up period in seconds to gradually increase load (default: 10)"
    )
    
    parser.add_argument(
        "--url",
        type=str,
        default=APP_URL,
        help=f"Base URL of the application (default: {APP_URL})"
    )
    
    args = parser.parse_args()
    
    if args.users < 1:
        print("❌ Error: Number of users must be at least 1")
        sys.exit(1)
    
    if args.duration < 1:
        print("❌ Error: Duration must be at least 1 second")
        sys.exit(1)
    
    # Update global URL if custom URL provided
    global API_BASE
    API_BASE = f"{args.url}/api/v1/payments"
    
    tester = StressTester(
        base_url=args.url,
        concurrent_users=args.users,
        duration=args.duration,
        ramp_up=args.ramp_up
    )
    
    try:
        await tester.run_stress_test()
        tester.print_results()
    except KeyboardInterrupt:
        print("\n\n⚠️  Test interrupted by user")
        tester.print_results()
    except Exception as e:
        print(f"\n❌ Fatal error: {e}")
        import traceback
        traceback.print_exc()
        sys.exit(1)

if __name__ == "__main__":
    asyncio.run(main())

