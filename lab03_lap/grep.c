/*
    File:     find.c
    Author:   Corwin Diamond
    Date:     12/9/2017
    Purpose:  This program replicates the grep utility in Unix based systems
    Usage:   ./grep <string><file>

    Code overview:
              Ensures goodish input, otherwise it displayBadInputMessage
              for each line in file
                if string_input found
                  display line with each string_input highlighted

                if string_input not found

*/
#define MAX_LINE_SIZE 1024
#include <stdio.h>
#include <stdlib.h>
#include <string.h>
#include <errno.h>


//display message for bad inpu, return type void
void displayBadInputMessage(int argv, char * argc []){
  printf("\n\e[31mSorry,");
  for(long int i = 1; i < argv; i++){
    printf(" %s", argc[i]);
  }
  printf(" was not valid input for this version of grep\e[m");
  printf("\n\e[mValid options are: grep");
  printf("\e[33m <string> <filename>\e[m\n");
  printf("\n\tstring is literal, only exact string matches, no wildcards");
  printf("\n\tstring must contained within a line,");
  printf("\n\t\tit will be ignored if text is wraped to next line");
  printf("\n\tfilename must be valid");
  printf("\n");
}

// open file filename and return pointer
FILE* openfile(const char * file_name){
  FILE * fptr = NULL;
  fptr = fopen(file_name, "r");

  if(fptr == NULL){
    fprintf(stderr,"\e[31mERROR:\e[m Unable to open file: ");
    fprintf(stderr, "\e[33m%s\n\e[m", file_name);
    fprintf(stderr, "\n\tfile() error on %s: %s\n", file_name,
            strerror(errno));
            printf("\n\e[mValid options are: grep");
            printf("\e[33m <string> <filename>\e[m\n");
            printf("\n\tstring is literal, only exact string matches,");
            printf(" no wildcards");
            printf("\n\tstring must contained within a line");
            printf("\n\t\tit will be ignored if text is wrapped to next line");
            printf("\n\t\e[31mfilename must be valid\e[m");
            printf("\n");
  }
  return fptr;
}


int main(int argv, char * argc []){
  int error = 0, string_found = 0;
  // int EOF_flag = 0;
  long long unsigned int line_number = 1;
  char curent_line[MAX_LINE_SIZE];
  char * string_input = argc[1];

  if(argv != 3){ //if wrong number of inputs
    displayBadInputMessage(argv, argc);
    error = 1;

  } else { //possibly good input
    FILE * fptr = openfile(argc[2]);
    if(fptr != NULL){    //if valid file

      //while can get next line
      while(fgets(curent_line, MAX_LINE_SIZE, fptr )!=NULL){

        // if string_input is in curent_line
        if(strstr(curent_line, string_input)!= NULL) {

          //print line number with color...simple code would print whole line
          printf("\e[33m%6llu: \e[m", line_number);

          //not simple code highlights string
          int i=0, j=0, flag=0; //flag = 1+ when printing substring
          string_found = 1;

          //iterate accross line from file
          for(i = 0; i < strlen(curent_line); i++ ){

            //if possible start of string_input substring in curent_line
            if(curent_line[i] == string_input[0]){
              //check for rest of substring
              for(j = 0; j < strlen(string_input); j++){

                if((int)curent_line[i + j] == (int)string_input[j])
                {
                  if(j+1 == strlen(string_input)){ //if string matched
                    //flag the next n chars to be colored
                    flag = strlen(string_input);
                  }
                }
              }
            }
            if(flag){
              printf("\e[31m");
              flag--;
            }
            printf("%c\e[m", curent_line[i]);
          }
        }
        line_number++;
      }
    }// if(fptr != NULL) valid file
  }  // else  --> goodish input
  if(!string_found)
    printf("\t\e[33m%s\e[m was not found in \e[33m%s\e[m\n", argc[1], argc[2]);
  return error;
}
