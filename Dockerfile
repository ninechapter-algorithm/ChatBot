# 构建前端
FROM node:18.17.1 AS frontend

# 安装vite
RUN npm install -g vite

# 指定工作目录
WORKDIR /app

# 复制文件
COPY /web/package.json /app
COPY /web/yarn.lock /app

# 安装依赖
RUN yarn

COPY /web /app

# 执行打包命令
RUN yarn build

# 构建后端
FROM node:18.17.1 AS backend

WORKDIR /app

COPY /service/package.json /app
COPY /service/yarn.lock /app

RUN yarn

COPY /service /app

RUN yarn build

# 构建服务
FROM node:18.17.1

WORKDIR /app

COPY /service/package.json /app
COPY /service/yarn.lock /app

RUN yarn

COPY /service /app
COPY --from=frontend /app/dist /app/public
COPY --from=backend /app/build /app/build

EXPOSE 3002

CMD [ "yarn", "prod" ]