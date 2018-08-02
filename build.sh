#!binbash	
if test $OS = Windows_NT	
then	
  # use .Net	
   .paketpaket.bootstrapper.exe	
  exit_code=$	
  if [ $exit_code -ne 0 ]; then	
  	exit $exit_code	
  fi	
   .paketpaket.exe restore	
  exit_code=$	
  if [ $exit_code -ne 0 ]; then	
  	exit $exit_code	
  fi	
  	
  [ ! -e build.fsx ] && .paketpaket.exe update	
  [ ! -e build.fsx ] && packagesFAKEtoolsFAKE.exe init.fsx	
  packagesFAKEtoolsFAKE.exe $@ --fsiargs -dMONO build.fsx 	
else	
  # use mono	
  mono .paketpaket.bootstrapper.exe	
  exit_code=$	
  if [ $exit_code -ne 0 ]; then	
  	exit $exit_code	
  fi	
   mono .paketpaket.exe restore	
  exit_code=$	
  if [ $exit_code -ne 0 ]; then	
  	exit $exit_code	
  fi	
   [ ! -e build.fsx ] && mono .paketpaket.exe update	
  [ ! -e build.fsx ] && mono packagesFAKEtoolsFAKE.exe init.fsx	
  mono packagesFAKEtoolsFAKE.exe $@ --fsiargs -dMONO build.fsx 	
fi