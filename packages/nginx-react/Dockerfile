FROM nginx:1.17

COPY dist/ /usr/share/nginx/html
ADD nginx/nginx.conf /etc/nginx/nginx.conf
ADD nginx/vhost.conf /etc/nginx/sites-enabled/vhost.conf
ADD nginx/vhost.locations /etc/nginx/sites-enabled/vhost.locations

COPY nginx/auto-reload-nginx.sh /home/auto-reload-nginx.sh
RUN chmod +x /home/auto-reload-nginx.sh

RUN apt-get update && apt-get install -y curl inotify-tools