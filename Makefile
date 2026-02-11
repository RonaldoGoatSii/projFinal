up:
	docker compose up --build

build:
	docker build -t g-javascript .

run: build
	docker run -it -v ${shell pwd}:/app g-javascript npm run start

bash: build
	docker run -it -v ${shell pwd}:/app g-javascript bash