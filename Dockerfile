FROM node:14
WORKDIR /usr/src/app
COPY ./ ./readme-generator-for-helm/
RUN cd readme-generator-for-helm
RUN ls
RUN npm install -g readme-generator-for-helm
