/*CSci4041 Fall’11 Programming Assignment 1
*section: 003
*login: diamo069
*date: 10/21/11
*name: Corwin Fletcher Diamond
*id: 3556489
*algorithm: Quick sort*/

/*Name:        qsort.cpp
  Author:      Corwin Diamond
  Date:        10/21/11
  Description: Quick sorts input file to output file
               Ussing the Hoare Partion Algorithm with random pivots*/
#include <assert.h>
#include <iostream>
#include <cmath>
#include <ctime>
#include <cstdlib>
using namespace std;

int main(int argc,char *argv[])//takes parameters filepath filepath int
{
    void quick_sort(int* array, int lptr, int rptr); //quick sorts array
    void get_input(char* file_name, int* a_in, int array_size);//gets input
    void output(char* file_name, int* a_out, int array_size);  //writes output
      
    int array_size = atoi(argv[3]);   //array_length is the third parameter
    int a_in[array_size];             //initialize array
    
    get_input(argv[1], a_in, array_size);  //get input from file ->a_in
    quick_sort(a_in, 0, array_size);       //quick sort a_in
    output(argv[2], a_in, array_size);     //output a_in to file  
    
}

void quick_sort(int* array, int lptr, int rptr)//bassed on Hoare Partition algm
{
    void set_pivot(int* array, int lptr, int rptr); //swaps random piv to rptr
    void bubble_sort(int* array, int lptr, int rptr); //sorts array between lptr and rptr
    void swap(int* array, int ptr1, int ptr2);        //swaps two array elements
    
    int pptr = rptr-1, part = 0; //pivot pointer
     
    if(rptr - lptr > 1)                   //while not trivial array to sort
    {   
         int i= lptr, j = rptr-2;      //used to traverse array to swap elements
         
         set_pivot(array, lptr, rptr); //pickes pivot at random and sends right
         
         while(i<j)                    //while traversers have not met
         {        
             if(array[i] < array[pptr])//if less then pivot
                 i++;                  //check next
             else                      //else
             if(array[j] >= array[pptr])//move j untill less then pivot
                 j--;
             else        //if both i and j need swaping
             {
                 swap(array, i++, j--); 
             }
             
         }
         if (array[i] >= array[pptr])//if i made last move
         {
             swap(array, i, pptr);   //move pivot to partition
             part = i;
         }
         else                        //else adjust and set partition
         {
             swap(array, i+1, pptr);
             part = i+1;
         }
         quick_sort(array,lptr, part);     //sort left of partition
         quick_sort(array,part+1,rptr);    //sort right of partition
    }
}

void set_pivot(int* array, int lptr, int rptr)//set random pivot to rptr
{
     void swap(int* array, int ptr, int rptr); //swaps elements
     int ptr = lptr + (rand()%(--rptr-lptr));  //pick random lptr <= ptr <= rptr
     swap(array, ptr, rptr);                   //set as rptr
}

void swap(int* array, int ptr, int rptr)       //swaps two elements
{
    int temp = array[ptr];                     
    array[ptr] = array[rptr];
    array[rptr] = temp;
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
