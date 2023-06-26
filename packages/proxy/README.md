When making changes to the proxy, rather than rebuilding the proxy manually, you can:

-   make your changes to nginx.conf.template
-   `docker exec` into the running container
-   copy the changes to `/etc/nginx/nginx.conf`
-   run: `nginx -s reload` to reload the proxy
