FROM node:26-slim

# WORKDIR /chimera-collab

# COPY package*.json ./
# RUN npm install --omit=dev

# # Yarn Classic(v1) をインストール
# RUN npm install -g yarn@1


# COPY . .

# EXPOSE 1234

# CMD ["npm", "start"]

ENV ROOT=/chimera-collab

RUN apt-get update && \
    apt-get upgrade -y && \
    apt-get install -y --no-install-recommends \
    ca-certificates \
    git \
    locales \
    vim && \
    rm -rf /var/lib/apt/lists/*

# 言語設定
RUN echo "ja_JP.UTF-8 UTF-8" >> /etc/locale.gen && \
    locale-gen ja_JP.UTF-8
ENV LANG=ja_JP.UTF-8

# Yarn Classic(v1) をインストール
RUN npm install -g yarn@1

WORKDIR $ROOT
