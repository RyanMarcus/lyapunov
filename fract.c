/*
Copyright 2016 Ryan Marcus

This program is free software: you can redistribute it and/or modify
it under the terms of the GNU General Public License as published by
the Free Software Foundation, either version 3 of the License, or
(at your option) any later version.

This program is distributed in the hope that it will be useful,
but WITHOUT ANY WARRANTY; without even the implied warranty of
MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE. See the
GNU General Public License for more details.

You should have received a copy of the GNU General Public License
along with this program.  If not, see <http://www.gnu.org/licenses/>.
 */


#include <math.h>
#include <stdio.h>

#define intRange(a, b) ((float) a / (float) b)

int sequence[12] = {1,1,1,1,1,1,0,0,0,0,0,0};
int seqLength = 12;

float lyExp(float a, float b);

void generateFractal(float left,
		     float bottom,
		     float width,
		     float height,
		     int windowWidth,
		     int windowHeight,
		     float* window) {
    
    for (int y = 0; y < windowHeight; y++) {
	for (int x = 0; x < windowWidth; x++) {
	    float a, b;

	    
	    a = intRange(x, windowWidth) * width + left;
	    b = intRange(y, windowHeight) * height + bottom;

	    window[x + y*windowWidth] = lyExp(a, b);
	}
    }
    
    
}

int N = 1000;

float lyExp(float a, float b) {
    float accum = 0.f;
    float iter = 0.5f;
    for (int i = 0; i < N; i++) {
	float r = (sequence[i % seqLength] == 1 ? b : a);
	// progress the iterator
	iter = r * iter * (1.f - iter);
	accum += logf(fabs(r * (1.f - 2.f * iter))) * 1.f/(float)N;

	//printf("%f %f -> %f %f at %d (%f)\n", a, b, accum, iter, i, r);
    }

    return accum;
    
}

int main() {
    float values[10000];
    generateFractal(2.5f, 3.0f, 1.0f, 1.0f, 100, 100, values);

    for (int i = 0; i < 100; i++) {
	for (int j = 0; j < 100; j++) {
	    printf("%0.2f ", values[i*10 + j]);
	}
	printf("\n");
    }
}

