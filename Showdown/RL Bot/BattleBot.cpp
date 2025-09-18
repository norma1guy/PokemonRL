#include <nlohmann/json.hpp>
#include <iostream>
#include <fstream>
using namespace std;
using json = nlohmann::json;
int main(){
    ifstream f("../../Data/battle_logs.json");
    json data = json::parse(f);
    cout << data.size() <<" Battles loaded\n";
    return 0;
}