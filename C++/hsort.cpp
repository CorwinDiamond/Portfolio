/*CSci4041 Fall’11 Programming Assignment 1
*section: 003
*login: diamo069
*date: 10/21/11
*name: Corwin Fletcher Diamond
*id: 3556489
*algorithm: Heap sort*/

/*Name:        hsort.cpp
  Author:      Corwin Diamond
  Date:        10/21/11
  Description: usses class heap that treats an array as if it were a heap
               and builds the heap into a max heap before and during a heap
               sort algorithm
               
               Heapsort sorts as it initializes */
#include <assert.h>
#include <iostream>
#include <cmath>
#include <ctime>
#include <cstdlib>
using namespace std;

//*****************************************************************************
//class heap, makes an array act like a heap for heap sort.

class heap {              //a heap that can be sorted
public:
    heap() : heap_array(0), heap_size(0) , heap_max(0) {}//defalt constructor
    heap(int* array, int size, int  max);  //constructs heap from an array
private:
    int* heap_array;          //heap h_array
    int heap_max;             //max size allocated for heap
    int heap_size;            //amout of elements "in" heap
    int left_child(int index) {return 2*index;}   //returns index of left child
    int right_child(int index) {return 2*index+1;}//returns index of right child
    void swap(int e1, int e2); //swaps two elements in the heap
    void max_heap();           //builds max heap
    void max_heapify(int index);//maintains max heap 
    void sort();                //performs heap sort
};

heap::heap(int* array, int size, int max)//initialize heap
{               
     heap_array = array;   
     heap_size = size;
     heap_max = max;
     max_heap(); //build heap
     sort();     //sort heap
}

void heap::max_heapify(int index) //maintain max heap qualities
{
    int l = left_child(index);    //get index of left child
    int r = right_child(index);   //get index of right child
    int largep = 0;               //index of larger element
    
    if( l <= heap_size && heap_array[l] >  heap_array[index])
        largep = l; //if left child larger then parent set as largest
    else
        largep = index;  //else parent is larger
    if( r <= heap_size && heap_array[r] > heap_array[largep])
        largep = r; //if right child is larger then both parent and left child
                                        //set as largest
    if(largep != index)                 //if parent not the largest
    {
        swap(index, largep);            //swap parent with largest child
        max_heapify(largep);            //ensure max heap on altered branch
    }
}

void heap::max_heap()                   //build max heap
{
    for(int i=heap_size/2; i>=0; i--)   //make heap into max heap by calling
        max_heapify(i);                 //max heap on leaves on up to the root
}

void heap::sort()                       //heap sort the heap
{
     int temp = heap_size;              //store size of array for retieval
     for(int i=heap_size; i>=1; i--)    //while not done sorting
     {       
         swap(0,i);                     //swap largest with last entry
         heap_size--;                   //take largest out of heap
         max_heapify(0);                //ensure heap is still a max heap.
     }
     heap_size = temp;                  //done sorting, re-assign heap size
}

void heap::swap(int e1, int e2)         //swaps to elements in heap
{
     int temp = heap_array[e1];
     heap_array[e1] = heap_array[e2];
     heap_array[e2] = temp;
}

//*****************************************************************************
//main, read in input file, heap sort, write output file

int main(int argc,char *argv[])
{
    void get_input(char* file_name, int* a_in, int array_size);//gets input
    void output(char* file_name, int* a_out, int array_size);  //writes output
      
    int array_size = atoi(argv[3]);   //array_length is the third parameter
    int a_in[array_size];             //initialize array
    
    get_input(argv[1], a_in, array_size);  //get input from file ->a_in
    heap h(a_in, array_size, array_size);  //heap sort a_in
    output(argv[2], a_in, array_size);     //output a_in to file
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
