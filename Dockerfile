FROM node:alpine
WORKDIR /svc
RUN apk add --no-cache \
        git &&\
    cd /svc
ADD package.json package-lock.json /svc/
RUN npm install
COPY . .
RUN npm run prod
CMD npm run start
