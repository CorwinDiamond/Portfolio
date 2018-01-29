/*
    File:     ls.c
    Author:   Corwin Diamond
    Date:     12/3/2017
    Purpose:  This program replicates the ls -l -a  utility in Unix based systems
    Usage:   ./ls <-l and or -a>
    script files: ls.dat and ls2.dat
    Code overview:
              Ensures goodish input, otherwise it displayBadInputMessage
              for each file in directory
                display names
                if -a flag
                  include .* files
                if -l flag
                  display file information as well
*/
#include <stdio.h>
#include <stdlib.h>
#include <string.h>
#include <sys/types.h>
#include <sys/stat.h>
#include <dirent.h>
#include <unistd.h>
#include <time.h>

//print file in folder
void list_file(char* file, int long_view){
  // int file_type = 0;
  struct stat file_stat;

  if(stat(file,&file_stat) < 0)
  return;

  // if executable, file type 2
  if( (file_stat.st_mode & S_IXUSR) || (file_stat.st_mode & S_IXGRP) ||
      (file_stat.st_mode & S_IXOTH) )
  fprintf(stderr, "\e[32m");

  // if directory, file type 1
  if(S_ISDIR(file_stat.st_mode))
  fprintf(stderr, "\e[36m");

  //if -l flag
  if(long_view){
    int permissions = file_stat.st_mode;
    fprintf(stderr,"\033[10G");

    //bit map the permissions using equivalent of right bitshifts
      //looking at right most bit and decoding which bit it is
    for(int i = 0; i < 9; i++){
      if(permissions % 2){ //if current bit
        //what the current on bit repersents and should be displayed
        switch(i%3){  //decode bits meaning
          case 0:  fprintf(stderr, "x");
          break;
          case 1:  fprintf(stderr, "w");
          break;
          case 2:  fprintf(stderr, "r");
          break;
        }
      } else {
        fprintf(stderr, "-"); //bit is off
      }
      permissions /= 2; //==right bit shift
      fprintf(stderr, "\033[2D");
    }
    S_ISDIR(file_stat.st_mode) % 2 ? fprintf(stderr,"d") : fprintf(stderr,"-");
    fprintf(stderr,"\033[12G%lu", file_stat.st_size); //size
    fprintf(stderr,"\033[20G%lu",file_stat.st_blocks);
    fprintf(stderr,"\033[27G%lu",file_stat.st_blksize);
    fprintf(stderr,"\033[38G%lu", file_stat.st_nlink);  //links
    fprintf(stderr,"\033[44G%lu", file_stat.st_ino); //file serial number
    fprintf(stderr,"\033[54G%u", file_stat.st_uid);  //user id
    fprintf(stderr,"\033[64G%u", file_stat.st_gid);  //group id
    // fprintf(stderr,"\033[66G%lu", file_stat.st_mtime); //mod time
    time_t t = file_stat.st_mtime;
    struct tm *tm;
    char buf[200];
    /* convert time_t to broken-down time representation */
    tm = localtime(&t);
    /* format time days.month.year hour:minute:seconds */
    strftime(buf, sizeof(buf), "%m.%d.%Y %H:%M:%S", tm);
    fprintf(stderr,"\033[78G%s", buf);
    fprintf(stderr,"\033[99G%s\n", file); //file name
  } else {
    fprintf(stderr,"%s\t", file);

  }
  fprintf(stderr, "\e[m" );
}

int main(int argv, char * argc []){
  char cwd[1024]; //curent working direcotry
  getcwd(cwd, sizeof(cwd));
  char *working_dir = cwd;
  DIR *dirp = NULL;
  struct dirent *dirptr = NULL;
  int list_all = 0, long_view = 0, error = 0;

  //esure the same flag is not used more than once
  if(argv > 3)
    error = 1;
  if(argv == 3 && strcmp(argc[1], argc[2])==0)
    error = 1;

  for(int i = 1; i < argv; i++){
    if(strcmp(argc[i], "-a")==0) {
      list_all=1;
    } else if(strcmp(argc[i], "-l")==0) {
      long_view=1;
    } else {
      error = 1;
      printf("\n\e[31mSorry, %s is not an included option", argc[i]);
      printf(" for this version of ls\e[m");
    }
  }
  if(error){
    printf("\n\e[mValid options are: ls \e[33m-l -a\e[m\n");
    printf("\n\tincluding the -l option includes file stats with output");
    printf("\n\tincluding the -a option includes .* files with the output");
  }

  //fprintf(stderr, "contents of : %s\n", working_dir);

  dirp = opendir((const char*)working_dir);
  if(dirp == NULL)
  {
    error = 1;
    fprintf(stderr,"\n\e[31mERROR:\e[m Unable to open the working directory");
  }

  //print_head(long_view);
  if(!error){
    if(long_view){
      fprintf(stderr,"\e[4;97mPermission");
      fprintf(stderr,"\033[12Gsize b\033[20Gblocks"); //size
      fprintf(stderr,"\033[27Gblock size");  //links
      fprintf(stderr,"\033[38Glinks");  //links
      fprintf(stderr,"\033[44Gserial"); //file serial number
      fprintf(stderr,"\033[54Guid");  //user id
      fprintf(stderr,"\033[64Ggid");  //group id
      fprintf(stderr,"\033[78Glast modified"); //mod time
      fprintf(stderr,"\033[99Gfile\n"); //mod time
    }
    fprintf(stderr, "\e[m" );
    for(int i=0; NULL != (dirptr = readdir(dirp)); i++){
      if(dirptr->d_name[0] != '.' || list_all)
      list_file(dirptr->d_name, long_view);
    }
  }
  printf("\n");
  return error;
}
