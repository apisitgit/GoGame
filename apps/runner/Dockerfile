FROM golang:1.23-alpine AS development

WORKDIR /app

COPY go.mod ./
RUN go mod download

COPY . .

ENV GOCACHE=/tmp/go-build-cache
ENV GOMODCACHE=/tmp/go-mod-cache

RUN go build -o /usr/local/bin/go-quest-runner ./cmd/runner

EXPOSE 8090

CMD ["go-quest-runner"]
