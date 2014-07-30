module.exports = function(grunt) {
    
    var copyright = '/*!\n' +
                    'Copyright 2014 Adobe Systems Inc.;\n' +
                    'Licensed under the Apache License, Version 2.0 (the "License");\n' +
                    'you may not use this file except in compliance with the License.\n' +
                    'You may obtain a copy of the License at\n' +
                    '\n' +
                    'http://www.apache.org/licenses/LICENSE-2.0\n' +
                    '\n' +
                    'Unless required by applicable law or agreed to in writing, software\n' +
                    'distributed under the License is distributed on an "AS IS" BASIS,\n' +
                    'WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.\n' +
                    'See the License for the specific language governing permissions and\n' +
                    'limitations under the License.\n' +
                    '*/\n\n';

    var howTo =     '/*\n\n' +
                    'To use iframeflow.js, simply include the script in your page:\n' +
                    '\n' +
                    '    <script src="/iframeflow.js"></script>\n' +
                    '\n' +
                    'Then invoke iframeflow:\n' +
                    '\n' +
                    '    <script>\n' +
                    '        window.iframeflow.doc();\n' +
                    '    </script>\n' +
                    '\n' +
                    'You may also target iframeflow to a specific content selector.\n' +
                    'See README for more details.\n' +
                    '\n' +
                    '*/\n\n';

    var IIFEopen = '(function() {\n"use strict";\n\n';
    var IIFEclose = '\n})();';
    
    var project = {
        files: ['src/*.js']
    }

    grunt.initConfig({
        pkg: grunt.file.readJSON('package.json'),

        header: copyright+howTo+IIFEopen,
        footer: IIFEclose,

        concat: {
            options: {
                stripBanners: 'true',
                banner: '<%= header %>',
                footer: '<%= footer %>'
            },
            dist: {
                src: project.files,
                dest: '<%= pkg.name %>.js'
            }
        },

        uglify: {
            options: {
                preserveComments: 'some'
            },
            dist: {
                src: ['<%= concat.dist.dest %>'],
                dest: '<%= pkg.name %>.min.js'
            }
        },

    });

    grunt.loadNpmTasks('grunt-contrib-uglify');
    grunt.loadNpmTasks('grunt-contrib-concat');
    
    grunt.registerTask('default', ['concat', 'uglify']);
    grunt.registerTask('build', ['concat', 'uglify']);
}