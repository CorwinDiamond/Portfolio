# Make file for 4061 Lab03 submission by diamo069
# set compiler
CMP=gcc
# compiler options
CFLAGS=-c -Wall
# linker flags
LFLAGS= -Wall

# define targets and linking
all: bin ls.o find.o grep.o
	@printf "\e[32mall: \e[m\033[12G"
	$(CC) $(LFLAGS) ls.o -o bin/ls
	@printf "\033[12G"
	$(CC) $(LFLAGS) find.o -o bin/find
	@printf "\033[12G"
	$(CC) $(LFLAGS) grep.o -o bin/grep
	@if [ -e "ls" ]; then echo "mv ls bin/ls"; mv ls bin/ls; fi
	@if [ -e "find" ]; then echo "mv ls bin/ls"; mv ls bin/ls; fi
	@if [ -e "grep" ]; then echo "mv ls bin/ls"; mv ls bin/ls; fi

# makesure bin exits before compiling
bin:
	@printf "\e[36mbin: \e[m\033[12G"
	mkdir bin

ls.o: ls.c
	@printf "\e[33mls.o: \e[m\033[12G"
	$(CMP) $(CFLAGS) ls.c

find.o: find.c
	@printf "\e[33mfind.o: \e[m\033[12G"
	$(CMP) $(CFLAGS) find.c

grep.o: grep.c
	@printf "\e[33mgrep.o: \e[m\033[12G"
	$(CMP) $(CFLAGS) grep.c

ls: ls.o bin
	@printf "\e[32mls: \e[m\033[12G"
	$(CC) $(LFLAGS) ls.o -o bin/ls

find: find.o bin
	@printf "\e[32mfind: \e[m\033[12G"
	$(CC) $(LFLAGS) find.o -o bin/find

grep: grep.o bin
	@printf "\e[32mgrep: \e[m\033[12G"
	$(CC) $(LFLAGS) grep.o -o bin/grep
# If bin exits, delete bin       next if *.o files exist, remove them
clean:
	@if [ -d "bin" ]; then printf "\e[31m\033[12Grm -r bin\n"; rm -r bin; fi
ifneq ($(wildcard *.o),)
	@printf "\e[31m\033[12Grm *.o\n"
	@rm *.o
endif
	@printf "\e[32mMADE CLEAN!\e[m\n"
