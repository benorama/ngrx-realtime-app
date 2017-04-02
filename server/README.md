The build.gradle uses the Gradle shadowJar plugin to assemble the application and all it's dependencies into a single "fat" jar.

To build the "fat jar"

    ./gradlew shadowJar

To run the fat jar:

    java -jar build/libs/server-1.0.0-fat.jar
