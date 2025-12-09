package in.ethiccode.paymentservice.config;

import org.springframework.context.annotation.Configuration;
import org.springframework.core.io.ClassPathResource;
import org.springframework.core.io.Resource;
import org.springframework.web.servlet.config.annotation.ResourceHandlerRegistry;
import org.springframework.web.servlet.config.annotation.WebMvcConfigurer;
import org.springframework.web.servlet.resource.ResourceResolver;
import org.springframework.web.servlet.resource.ResourceResolverChain;

import jakarta.servlet.http.HttpServletRequest;
import java.util.List;

@Configuration
public class WebConfig implements WebMvcConfigurer {

    @Override
    public void addResourceHandlers(ResourceHandlerRegistry registry) {
        // Serve React static files
        registry.addResourceHandler("/**")
                .addResourceLocations("classpath:/static/")
                .resourceChain(true)
                .addResolver(new ReactResourceResolver());
    }

    // Resolver to serve index.html for React Router routes
    private static class ReactResourceResolver implements ResourceResolver {
        @Override
        public Resource resolveResource(HttpServletRequest request, String requestPath,
                                       List<? extends Resource> locations, ResourceResolverChain chain) {
            Resource resource = chain.resolveResource(request, requestPath, locations);
            if (resource == null && !requestPath.startsWith("/api") && !requestPath.equals("/ping")) {
                // For non-API routes, serve index.html (React Router will handle routing)
                resource = new ClassPathResource("/static/index.html");
            }
            return resource;
        }

        @Override
        public String resolveUrlPath(String resourcePath, List<? extends Resource> locations,
                                    ResourceResolverChain chain) {
            return chain.resolveUrlPath(resourcePath, locations);
        }
    }
}

