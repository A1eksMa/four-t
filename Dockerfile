FROM nginx:alpine
COPY nginx-container.conf /etc/nginx/conf.d/default.conf
WORKDIR /usr/share/nginx/html
