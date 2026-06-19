allprojects {
    repositories {
        google()
        mavenCentral()
    }
}

val newBuildDir: Directory =
    rootProject.layout.buildDirectory
        .dir("../../build")
        .get()
rootProject.layout.buildDirectory.value(newBuildDir)

subprojects {
    val newSubprojectBuildDir: Directory = newBuildDir.dir(project.name)
    project.layout.buildDirectory.value(newSubprojectBuildDir)
}
subprojects {
    project.evaluationDependsOn(":app")
}

// Force all Android modules (including Flutter plugins like :flutter_appauth) to
// compile against a modern API level. Some plugins still hardcode an old
// compileSdk (e.g. flutter_appauth = 31) whose AndroidX deps now require 34+.
subprojects {
    val compileSdkApi = 36

    fun forceCompileSdk() {
        val androidExt = extensions.findByName("android") ?: return
        // AGP DSL/types vary; use reflection and try every known setter shape.
        // Setter args may be primitive int (AGP 7 BaseExtension) or boxed
        // Integer (AGP 8/9 CommonExtension `var compileSdk: Int?`).
        val argTypes = listOf(Int::class.javaPrimitiveType, Integer::class.java)
        val setters = listOf("setCompileSdk", "setCompileSdkVersion", "compileSdkVersion")

        for (name in setters) {
            for (argType in argTypes) {
                val ok =
                    runCatching {
                        androidExt.javaClass
                            .getMethod(name, argType)
                            .invoke(androidExt, compileSdkApi)
                        true
                    }.getOrDefault(false)
                if (ok) return
            }
        }
    }

    // Run AFTER each module's own build script (which may set an old compileSdk).
    // `:app` is already evaluated here via evaluationDependsOn above, so calling
    // afterEvaluate on it would throw — set it inline in that case.
    if (state.executed) {
        forceCompileSdk()
    } else {
        afterEvaluate { forceCompileSdk() }
    }
}

tasks.register<Delete>("clean") {
    delete(rootProject.layout.buildDirectory)
}
