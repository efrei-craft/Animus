FROM node:alpine3.16

WORKDIR /app

COPY . .

RUN ls -la

RUN npm install && npx prisma generate

EXPOSE 3000

CMD ["npm", "run", "start:dev"]