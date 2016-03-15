
all: fract.js render.min.js


fract.js: fract.c
	emcc  -Wall -O3 fract.c -o fract.js -lm --closure 1 -s EXPORTED_FUNCTIONS="['_generateFractal', '_randomizeSequence']"

render.min.js: render.js
	babel render.js | uglifyjs > render.min.js



.phony: clean all

clean:
	rm -f fract.js render.min.js fract.min.js

