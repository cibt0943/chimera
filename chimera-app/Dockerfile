FROM node:24-slim

ENV APP_ROOT=/chimera-app

RUN apt-get update && \
    apt-get upgrade -y && \
    apt-get install -y --no-install-recommends \
    locales \
    vim && \
    rm -rf /var/lib/apt/lists/*

# 言語設定
RUN echo "ja_JP.UTF-8 UTF-8" >> /etc/locale.gen && \
    locale-gen ja_JP.UTF-8
ENV LANG=ja_JP.UTF-8

WORKDIR $APP_ROOT
