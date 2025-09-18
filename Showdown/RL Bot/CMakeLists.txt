cmake_minimum_required(VERSION 3.14)
project(BATTLEBOT LANGUAGES CXX)

set(CMAKE_CXX_STANDARD 17)
find_package(nlohmann_json CONFIG REQUIRED)
add_executable(bot battlebot.cpp)
target_link_libraries(bot PRIVATE nlohmann_json::nlohmann_json)
