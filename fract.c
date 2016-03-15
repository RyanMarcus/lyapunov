/*
  Copyright 2016 Ryan Marcus

  This file is part of ryan-frac-gen.

  ryan-frac-gen is free software: you can redistribute it and/or modify
  it under the terms of the GNU General Public License as published by
  the Free Software Foundation, either version 3 of the License, or
  (at your option) any later version.

  ryan-frac-gen is distributed in the hope that it will be useful,
  but WITHOUT ANY WARRANTY; without even the implied warranty of
  MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE. See the
  GNU General Public License for more details.

  You should have received a copy of the GNU General Public License
  along with this program.  If not, see <http://www.gnu.org/licenses/>.
*/


#include <math.h>
#include <stdio.h>
#include <stdlib.h>
#include <time.h>



#define intRange(a, b) ((float) a / (float) b)
#define ITERATIONS_PER_ROUND 1

int sequence[12] = {1,0,1,0,1,0,1,0,1,0,1,0};
int seqLength = 12;


void randomizeSequence() {
    srand(time(NULL));

    for (int i = 0; i < seqLength; i++) {
	sequence[i] = (rand() > RAND_MAX / 2 ? 1 : 0);
    }
    
}

void lyExp(float a, float b, float* window, float* iterWindow, int iterations);

int generateFractal(float left,
		    float bottom,
		    float width,
		    float height,
		    int windowWidth,
		    int windowHeight,
		    float* window,
		    float* iterWindow,
		    int iterations) {


    int targetIterations = iterations + ITERATIONS_PER_ROUND;
    for (int y = 0; y < windowHeight; y++) {
	for (int x = 0; x < windowWidth; x++) {
	    float a, b;

	    
	    a = intRange(x, windowWidth) * width + left;
	    b = intRange(y, windowHeight) * height + bottom;

	    for (int i = iterations; i < targetIterations; i++) {
		lyExp(a, b,
		      window + (x + y * windowWidth),
		      iterWindow + (x + y * windowWidth),
		      i);
	    }
	    
	}
    }


    return ITERATIONS_PER_ROUND;

    
    
}


void lyExp(float a, float b, float* accum, float* iter, int iteration) {
    //for (int i = 0; i < ITERATIONS_PER_ROUND; i++) {
    
    float r = (sequence[iteration % seqLength] == 1 ? b : a);
    // progress the iterator
    *iter = r * (*iter) * (1.f - (*iter));
    
    // do a running average...
    float newTerm = logf(fabs(r * (1.f - 2.f * (*iter))));
    
    *accum = *accum + ((newTerm - *accum) / (float)(iteration + 1));
    
    //printf("%f %f -> %f %f at %d (%f)\n", a, b, *accum, *iter, i, r);
    
    //}

}

int main() {
    float values[100*100];
    float iterValues[100*100];
    int iterations = 0;
    
    for (int i = 0; i < 100*100; i++) {
	values[i] = 0.f;
	iterValues[i] = 0.5f;
    }
	   

    for (int i = 0; i < 100; i++) {
	iterations += generateFractal(2.5f, 2.5f, 1.0f, 1.0f, 100, 100,
				      values, iterValues,
				      iterations);
    }
    for (int i = 0; i < 100; i++) {
	for (int j = 0; j < 100; j++) {
	    printf("%0.2f ", values[i*10 + j]);
	}
	printf("\n");
    }
}

