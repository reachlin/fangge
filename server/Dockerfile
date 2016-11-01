FROM node:argon

RUN mkdir -p /var/app/
ADD . /var/app
WORKDIR /var/app
# replace this with your application's default port
EXPOSE 8080
CMD ["npm", "start"]