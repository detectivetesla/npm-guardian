FROM node:20-alpine

# Install strace for system call tracing (dynamic analysis)
# Install bash and python3 for potential build scripts in npm packages
RUN apk add --no-cache strace bash python3 make g++ 

# Create an unprivileged user to safely run untrusted code
RUN addgroup -S sandboxgroup && adduser -S sandboxuser -G sandboxgroup

WORKDIR /sandbox

# Copy the dynamic analysis entrypoint script
COPY analyze.sh /sandbox/analyze.sh
RUN chmod +x /sandbox/analyze.sh

# Change ownership so the unprivileged user can write to /sandbox
RUN chown -R sandboxuser:sandboxgroup /sandbox

# Switch to unprivileged user
USER sandboxuser

# When the container starts, it will run analyze.sh with the package name as the argument
ENTRYPOINT ["/sandbox/analyze.sh"]
