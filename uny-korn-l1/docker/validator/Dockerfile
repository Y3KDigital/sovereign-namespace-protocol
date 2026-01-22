FROM rust:1.75

WORKDIR /node
COPY . .

RUN cargo build --release -p unykorn-node

CMD ["./target/release/uny-korn-node"]
