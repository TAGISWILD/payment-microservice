#!/bin/bash

# Start Spring Boot in background
java -Dserver.port=$PORT -jar build/libs/payment-service-1.0-SNAPSHOT.jar &
SPRING_PID=$!

# Wait for Spring Boot to start
echo "Waiting for Spring Boot to start..."
sleep 10

# Start React app (Vite preview mode for production)
cd frontend
npm run build
npm run preview -- --port ${FRONTEND_PORT:-5173} --host 0.0.0.0 &
REACT_PID=$!

# Wait for both processes
wait $SPRING_PID $REACT_PID

