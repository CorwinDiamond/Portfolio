/*CSci4041 Fall’11 Programming Assignment 1
*section: 003
*login: diamo069
*date: 10/21/11
*name: Corwin Fletcher Diamond
*id: 3556489
*algorithm: Counting sort*/
/*Name:        csort.cpp
  Author:      Corwin Diamond
  Date:        10/20/11
  Description: counting sort algorithm using stats from the input array to
               optimize memory allocation. ie k = max_in - min_in for array c[k]
*/
//libraries
#include <assert.h>
#include <iostream>
#include <cmath>
#include <ctime>
#include <cstdlib>
using namespace std;

//***************************************************************************
//class array_stats, scans an array to find the min and max values.

class array_stats{
public:
    array_stats(const int* array, int array_size);//constructor scans array
    int max_val(){return max_in;}                 //selector returns max
    int min_val(){return min_in;}                 //selector returns min
private:
    int max_in;                                   //max value scaned
    int min_in;                                   //min value scaned
};

array_stats::array_stats(const int* array, int array_size)//construct and scan
{
    assert(array_size!=0);          //ensure array exists
    max_in = array[0];              //set max and min to first element
    min_in = array[0];
    for(int i=0;i<array_size;i++)   //scan rest of the array
    {
        if(array[i]>max_in)         //if a larger value encounterd
            max_in = array[i];            //set as new max
        else if(array[i]<min_in)    //if a smaller value encounterd
            min_in = array[i];            //set as new min
    }
}

//***************************************************************************
//class counts utilizes counting sort to sort an input array to an output array

class counts{
public:
    counts(int max_in, int min_in, int array_size); //constructor w/ arraystats
    void sort(const int* a_in, int* a_out);         //sorts a_in -> a_out
    //void print_c();
private:
    int* c;          //array to count input values
    int max;         //max input used to find k
    int min;         //used to find k and adjust array c
    int size;        //length of array to be sorted
    int k;           //represents the range of input_values; also = length of c
};

counts::counts(int max_in, int min_in, int array_size) //constructor
{                              //store array stats and compute k
    max = max_in;                             
    min = min_in;                             
    k = (max - min)+1;         //compute k
    size = array_size; 
    c = new int[k];             //initialize array c;
    assert(c!=0);               //ensure array c created
    for(int i=0; i < k; i++)    //initialize c[all] to 0;
        c[i] = 0; 
}

void counts::sort(const int* a_in, int* a_out)//sort a_in into a_out;
{
    for(int i=0; i<size; c[a_in[i++]-min]++)// count number of each input value
        ;                                   //lines 4 and 5 in textbook
    
    for(int i=1; i<k; c[i] += c[i++ - 1]) //sum array, number of elements before
        ;                                   //lines 7 and 8 in textbook
    
    for(int i=size-1; i>=0;i--)             //output to a_out
    {                                       //lines 10 through 12 in textbook
        a_out[c[a_in[i]-min]-1] = a_in[i];
        c[a_in[i]-min]--;
    }
}

int main(int argc,char *argv[])
{   
    void count_sort(int* array_in, int* array_out, int array_size);//count sort
    void get_input(char* file_name, int* a_in, int array_size);//gets input
    void output(char* file_name, int* a_out, int array_size);  //writes output
      
    int array_size = atoi(argv[3]);   //array_length is the third parameter
    int a_in[array_size];             //initialize array
    int a_out[array_size];
    
    get_input(argv[1], a_in, array_size);  //get input from file ->a_in
    count_sort(a_in, a_out, array_size);  //count sort a_in
    output(argv[2], a_out, array_size);     //output a_in to file
}

void count_sort(int* array_in, int* array_out, int array_size)//sorts in->out
{
    array_stats a(array_in, array_size);          //scan input array for stats
    counts c(a.max_val(),a.min_val(),array_size); //initialize buckets
    c.sort(array_in,array_out);
}

void get_input(char* file_path, int* a_in, int array_size) //read in input
{                                                          //from file
     int temp;                                   //temp container for input data
     FILE* fptr = fopen(file_path,"r");          //open file pointer
     assert(fptr!=0);                            //ensure file contains data
     for(int i=0; i<array_size; i++)             //while expecting more data
     {
         assert(fscanf(fptr,"%d",&temp)!=EOF);   //read in data
         a_in[i] = temp;                         //assign to array
     }
     fclose(fptr);                               //close file
}

void output(char* file_path, int* a_out, int array_size)//write output to file
{    
    FILE* fptr = fopen(file_path,"w");  //open file
    assert(fptr != 0);                  //ensure file opens
    for(int i=0; i<array_size; i++)     //while more data to write
        fprintf(fptr,"%i\n",a_out[i]);  //write data
    fclose(fptr);                       //close file
}
