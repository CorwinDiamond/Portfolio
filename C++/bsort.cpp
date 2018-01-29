/*CSci4041 Fall’11 Programming Assignment 1
*section: 003
*login: diamo069
*date: 10/21/11
*name: Corwin Fletcher Diamond
*id: 3556489
*algorithm: bucket sort*/

/*Name:        bsort.cpp
  Author:      Corwin Diamond
  Date:        10/20/11
  Description: Bucket sort algorithm
                      hash input values into buckets of singly linked lists
                      then use insertion sort on those lists to sort data
                      
                      output is done by reading out the singly linked lists*/
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

//*****************************************************************************
// define Singly linked list data structure used to stor data in buckets
// for their ability to be dynamicaly allocated reducing memory overhead

class slist{ //singly linked list used for dynamicly alocated bucket storage
public:
    slist() : next(0){}                         //new blank singly linked list
    slist(int value) : data(value), next(0){}   //new single value
    void insert(int value);                     //insert value in sorted list
    int output(int* array, int size, int end_of_data = 0 );//output list->array
    int data;                          //data stored in this element of the list
    slist* next;                       //pointer to next element
private:
};

void slist::insert(int value) //using a modified insertion sort to insert data
{
    if(data > value)                     //if value should be inserted
    {     //> makes the insert stable           
        slist* add_me = new slist;       //inset new element
        assert(add_me!=0);               //ensure memory is allocated
        add_me -> data = data;           //initialize element
        add_me -> next = next;           
        data = value;                    //replace current element with new data
        next = add_me;                   //link elements together
    }
    else if(next == 0)                   //elseif end of list encountered insert
    {
        slist* add_me = new slist;       //adds new element to end of list
        assert(add_me!=0);               //ensure memory allocated
        add_me -> data = value;          //initialize new element 
        add_me -> next = 0;
        next = add_me;                   //add new element
    }
    else
        next -> insert(value);           //else recurse down the list
}
   
int slist::output(int* array, int size, int end_of_data) //output list -> array
{
    assert(end_of_data<=size);               //make sure not at end of the array
    array[end_of_data++] = data;             //put current element in array
    if(next != 0)                            //if not the end of the list
        end_of_data = next -> output(array, size, end_of_data);//go to next
    return end_of_data;                      //return index of last array entry
}  

//*****************************************************************************
//class bucket creates an array of singly linked lists. 
//    the size of the array is defined by the constant NUMBER_OF_BUCKETS
//    located under the libraries used
//data inserted into the bucket will be inserted into singly linked lists using
//a modified insertion sort

class bucket{
public:
    bucket(int max_in, int min_in, int num_of_buckets);   //constructor
    void a_in(const int* array, int size); //sorts input array into buckets
    void output(int* array, int size);//outputs sorted data into array[]
private:
    slist* buckets;                   //array of singly linked lists
    int number_of_buckets;            //number of buckets in array
    int in_scale;                     //scaler for incoming data befor hashing
    int in_adjust;                    //adjusting data before hashing
    int bucket_hash(int input_value); //hashes input into appropriate buckets
    void input(int value);            //places values from input array in bucket
};          

bucket::bucket(int max_in, int min_in, int num_of_buckets)//constructor
{
    number_of_buckets = num_of_buckets;    //set number_of_buckets used in sort
    buckets = new slist[number_of_buckets];//make array of singly linked lists
    assert(buckets!=0);                    //ensure memory was allocated
    for(int i=0; i<number_of_buckets; i++) //initialize buckets as empty
        buckets[i]=0;
    in_scale = max_in - min_in +1; //used to make max input <1 durring hashing
    in_adjust = min_in;            //used to make min input 0 durring hashing
}

void bucket::a_in(const int* array, int size)//sorts input array into buckets
{
    assert(size != 0);                       //check if data exists
    for(int i=0; i<size; i++)                //while more data
        input(array[i]);                     //put in buckets
}

int bucket::bucket_hash(int input_value)    //identifies bucket input hashes too
{//(input-min_input)/(max_input-min_input+1)*number of buckets
    double decimal = (double) (input_value - in_adjust) /in_scale;//0<=decimal<1
    int bucket_number = (int)(decimal * number_of_buckets);//(int) truncates
    return bucket_number;
}

void bucket::input(int input_value)//places input value into appropriate bucket
{
     int hash_value = bucket_hash(input_value);  //get bucket number
     if( buckets[hash_value].next == 0)          //if bucket empty
     {
         slist* new_list = new slist;            //put first element in bucket
         assert(new_list!=0);
         new_list -> data = input_value;
         new_list -> next = 0;
         buckets[hash_value].next = new_list;
     }
     else                 //else bucket not empty; input input into sorted list
         buckets[hash_value].next -> insert(input_value);
}

void bucket::output(int* array, int size)//outputs sorted buckets into an array
{
     int end_of_data=0;                  //index of last value inserted in array
     for(int i=0; i < number_of_buckets; i++)//while more buckets to output
         if(buckets[i].next != 0)        //and if bucket not empty
             end_of_data=buckets[i].next->output(array,size,end_of_data);
}                //output bucket[i]'s list to array

int main(int argc,char *argv[])
{   
    void bucket_sort(int* array_in, int* array_out, int array_size);//sorts
    void get_input(char* file_name, int* a_in, int array_size);//gets input
    void output(char* file_name, int* a_out, int array_size);  //writes output
    
    int array_size = atoi(argv[3]);   //array_length is the third parameter
    int a_in[array_size];             //initialize array
    int a_out[array_size];
    
    get_input(argv[1], a_in, array_size);  //get input from file ->a_in
    bucket_sort(a_in,a_out,array_size);    //perform bucket sort on a_in
    output(argv[2], a_out, array_size);     //output a_out to file
}

void bucket_sort(int* array_in, int* array_out, int array_size)//sorts in->out
{
    array_stats a(array_in, array_size);          //scan input array for stats
    bucket b(a.max_val(),a.min_val(),array_size); //initialize buckets
    b.a_in(array_in,array_size);                  //sort input into buckets
    b.output(array_out,array_size);               //output buckets to array
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
