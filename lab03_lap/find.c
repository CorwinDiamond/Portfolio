/*
    File:     find.c
    Author:   Corwin Diamond
    Date:     12/9/2017
    Purpose:  This program replicates the find utility in Unix based systems
    Usage:   ./find <filename><starting directory> -t

              <starting directory> may be set as . for current directory
                or omitted.

              -t turns on trace.  (default is off)
                causes files that don't match to be printed

    Code overview:
              main calls function find
                find runs on directory passed to it
                  if file being checked is a folder
                    recursivly call find on that folder

*/
//#define _POSIX_SOURCE
#include <stdio.h>
#include <stdlib.h>
#include <string.h>
#include <sys/types.h>
#include <sys/stat.h>
#include <dirent.h>
#include <unistd.h>
#include <time.h>
#include <errno.h>

//find prototype
int find(int argv, char * argc []);

//function displays bad input error message
void displayBadInputMessage(int argv, char * argc []){
  printf("\n\e[31mSorry,");
  for(long int i = 1; i < argv; i++){
    printf(" %s", argc[i]);
  }
  printf(" was not valid input for this version of find\e[m");
  printf("\n\e[mValid options are: find");
  printf("\e[33m <filename> <starting directory> -t\e[m\n");
  printf("\tcurrent directory is the default starting directory");
  printf("\n\tif and only if a starting directory is included,");
  printf("\n\t\t-t may be used to show the files and directories searched\n");
}

//This function checks out the individual file
int checkoutFile(char* file , int trace, int argv, char* argc [],
      char* workingDir){
  struct stat file_stat;
  char* lookingFor = argc[1];

  if(stat(file,&file_stat) < 0){
    return 0;
  }

  //if these are the -d-r-o-i-d-s- files you are looking for
  if(strcmp(file, lookingFor)==0){
    printf("\e[33m%s/\e[31m%s\e[m\n",workingDir,file);
  } else{

    //if trace flag enabled, print files you were not looking for
    if(trace){
      if(strcmp(file, ".")!=0 && strcmp(file, "..")!=0)
        printf("%s/%s\n",workingDir,file);
    }
  }

  //if file is a directory, recurse into it.
  if(S_ISDIR(file_stat.st_mode)){
    if(strcmp(file, ".")!=0 && strcmp(file, "..")!=0){
      argc[2]=file;
      // printf("\n\nFind in DIR: %s", file);
      find(argv, argc);
    }
  }
  return 0;
}

// find is called on a directory and searches all files
int find(int argv, char * argc []){
  char cwd[1024]; //curent working direcotry
  getcwd(cwd, sizeof(cwd));
  char *working_dir = cwd;
  DIR *dirp = NULL;
  struct dirent *dirptr = NULL;
  int error = 0, trace = 0;

  //if possibly bad input
  if(argv <= 2 || argv > 3){
    //not bad input in this case, adding trace flag
    if(argv == 4 && strcmp(argc[3], "-t")==0){
      trace = 1;
    } else {
      error = 1;
      displayBadInputMessage(argv, argc);
    }
  }

  // if probably good input
  if(argv >=3 && error != 1){
    int errorcheck = chdir(argc[2]); //swich to input directory
    if(errorcheck != 0){             //if it did not work
      error = 1;                        // handle error
      fprintf(stderr,"\e[31mERROR:\e[m Unable to open directory: ");
      fprintf(stderr, "\e[33m%s\n\e[m", argc[2]);
      fprintf(stderr, "\n\tstat() error on %s/%s: %s\n", working_dir, argc[2],
              strerror(errno));
      displayBadInputMessage(argv, argc);
    } //else changed directory
    argc[2] = ".";  //incase of recusrion, input directory set to this directory
    getcwd(cwd, sizeof(cwd));  //get curent working directory
    working_dir = cwd;         //save as working directory
  }

  dirp = opendir((const char*)working_dir);  //directory pointer = open this

  if(dirp == NULL)  //if unable to open directory
  {
    error = 1;
    fprintf(stderr,"\n\e[31mERROR:\e[m Unable to open the working directory");
    fprintf(stderr, "\n\tstat() error on %s: %s\n", working_dir,
            strerror(errno));  //print error
  }

  // makesure no errors have been encountered
  if(!error){
    fprintf(stderr, "\e[m" ); //text color = default
    //for dir pointers in directory
    for(long int i=0; NULL != (dirptr = readdir(dirp)); i++){
       if(!error){ //ensure no errors
         int errorcheck = chdir(working_dir); //ensure correct directory is open
         if(errorcheck != 0){                 //without errors because of recurs
           error = 1;
           fprintf(stderr,"\e[31mERROR:\e[m Unable to open directory: ");
           fprintf(stderr, "\e[33m%s\n\e[m", working_dir);
           fprintf(stderr, "\n\tstat() error on %s: %s\n", working_dir,
                   strerror(errno));
           return error;
         }
       }
      if(!error){

        //because of recursion, the wrong dirp may be open
        if(dirp != NULL)
          closedir(dirp);

        dirp = opendir((const char*)working_dir);

        if(dirp == NULL) //makesure no error
        {
          error = 1;
          fprintf(stderr,"\n\e[31mERROR:\e[m Unable to open the working directory");
          fprintf(stderr, "\e[33m%s\n\e[m", working_dir);
          fprintf(stderr, "\n\tstat() error on %s: %s\n", working_dir,
                  strerror(errno));
          return error;
        }
      }
      if(!error){
        //because of recursion, file may have needed to be repoend
          //iterate trhough all files in directory that have been viewed
        long int j = 0;
        for(j=0; j < i; j++)
          dirptr = readdir(dirp);

        //check next file in current directory for a match with input
        error = checkoutFile(dirptr->d_name, trace, argv, argc, working_dir);
      }
    }
  }
  if(!error && dirp!= NULL)
  {
    closedir(dirp);     //cleanup cleanup everybody everywhere
  }
  return error;
}

// main
int main(int argv, char * argc []){
  //if no directory included in input, assume this directory
  if(argv == 2){
    argv = 3;
    argc[2] = ".";
  }

  //if no directory included in input, but -trace flag included,
      //assume this directoru
  if(argv == 3){
    if(strcmp(argc[2], "-t") == 0 ){
      argv = 4;
      argc[3] = argc[2];
      argc[2] = ".";
    }
  }

  //start recursive process
  return find(argv,argc);
}
