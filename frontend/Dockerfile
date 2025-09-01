FROM node:22 AS build

# Définir les arguments de build
ARG COUNTRY
ARG ENV

# Les rendre disponibles comme variables d'environnement
ENV COUNTRY=${COUNTRY}
ENV VITE_COUNTRY=${COUNTRY}
ENV ENV=${ENV}

WORKDIR /app

COPY package*.json ./
RUN npm install
COPY . .
RUN npm run build

FROM nginx:alpine
COPY --from=build /app/dist /usr/share/nginx/html
COPY nginx.conf /etc/nginx/conf.d/default.conf

EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
