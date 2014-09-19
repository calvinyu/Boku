#include<iostream>
using namespace std;
int doubleIt(int num){
	return num<<1;
}
int main(){
	int a = 12;
	cout<<doubleIt(a)<<endl;
	return 0;
}
