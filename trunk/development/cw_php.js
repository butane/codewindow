/* 
**************************
*  Code Window - PHP     *
*  Author - Vivek Dinesh *
*  Version : 1.0         *
**************************
*/
/*
   Copyright 2012 Vivek Dinesh

   Licensed under the Apache License, Version 2.0 (the "License");
   you may not use this file except in compliance with the License.
   You may obtain a copy of the License at

       http://www.apache.org/licenses/LICENSE-2.0

   Unless required by applicable law or agreed to in writing, software
   distributed under the License is distributed on an "AS IS" BASIS,
   WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
   See the License for the specific language governing permissions and
   limitations under the License.

*/

//Defining basic tools
var cw_basic = {
	"byId"		:	function(id) {
						return document.getElementById(id);
	},
	"byTag"		:	function(tag) {
						return document.getElementsByTagName(tag);
	},
	"inner" 	:	function(id) {
						return cw_basic.byId(id).innerHTML;
	},
	"replaceAll": function(data, findChar, replaceChar) {
						var output = '';
						for(var i=0;i<data.length;i++) {
							if(data[i] == findChar)
								output += replaceChar;
							else
								output += data[i];
						}
						return output;
	},
	"frameCode"	:	function(className, data) {
						return '<code class=\"' + className + '\">' + data + '</code>';
	},
	"tableIt"	:	function(data) {
						var i, line=1, temp='', table = '<table class=\"cw_table\">';
						for(i=0;i<data.length;i++) {
							if(data[i] != '\n') {
								temp += data[i];
							} else {
								if(line%2==0)
									table += '<tr class=\"cw_tr_even\">';
								else
									table += '<tr class=\"cw_tr_odd\">';
								table += '<td class=\"cw_td_line\">' + line++ + '</td>';
								table += '<td class=\"cw_td_code\">' + temp + '</td></tr>';
								temp = '';
							}
						}
						table += '</table>';
						return table;
	}
}

//Defining PHP related entities
var cw_php = {
	"class" : {
				"comment" 	:	"cw_comment",
				"keywords"	:	"cw_keywords",
				"functions"	:	"cw_functions",
				"variables"	:	"cw_variables",
				"constants"	:	"cw_constants",
				"squotes"	:	"cw_squotes",
				"dquotes"	:	"cw_dquotes",
				"php_tags"	:	"cw_php_tags"
	},
	"keywords"	:	["if", "else", "switch", "case", "break", "continue", "return", "for", "while", "do", "foreach", "function", "class"],
	"functions"	:	["echo", "strlen", "substr"],
	"constants"	:	["true", "TRUE", "false", "FALSE", "null", "NULL"],
	"isKeyword"	:	function(data) {
						var i;
						for(i=0;i<cw_php.keywords.length;i++)
							if(cw_php.keywords[i]==data)
								return true;
						return false;
	},
	"isFunction":	function(data) {
						var i;
						for(i=0;i<cw_php.functions.length;i++)
							if(cw_php.functions[i]==data)
								return true;
						return false;
	},
	"isConstant":	function(data) {
						var i;
						if(!isNaN(data)) return true;
						for(i=0;i<cw_php.constants.length;i++)
							if(cw_php.constants[i]==data)
								return true;
						return false;
	},
	"isVariable":	function (data) {
						if(data.length>1 && data[0]=='$') return true;
						else return false;
	},
	"isBreak"	:	function(data) {
						if(data==' ') return true;
						else if(data=='\t') return true;
						else if(data=='\n') return true;
						else if(isNaN(data)) {
							if(data>='a' && data<='z') return false;
							else if(data>='A' && data<='Z') return false;
							else if(data=='_' || data=='$') return false;
							else return true;
						} else {
							return false;
						}
	},
	"processBasic" : function(data) {
						if(cw_php.isKeyword(data)) return cw_basic.frameCode(cw_php.class.keywords, data);
						else if(cw_php.isFunction(data)) return cw_basic.frameCode(cw_php.class.functions, data);
						else if(cw_php.isConstant(data)) return cw_basic.frameCode(cw_php.class.constants, data);
						else if(cw_php.isVariable(data)) return cw_basic.frameCode(cw_php.class.variables, data);
						else return data;
	},
	"start"		:	function() {
						var php = cw_basic.byTag('pre');
						for(var i=0; i<php.length; i++) {
							if(php[i].className=='cw_php') {
								var data = php[i].innerHTML;
								data = cw_php.colorIt(data);
								data = cw_basic.tableIt(data);
								php[i].innerHTML = data;
							}
						}
	},
	"colorIt"	:	function(data) {
						var output='', buffer='';
						for(var i=0;i<data.length;i++) {
							if(!cw_php.isBreak(data[i])) {
								buffer += data[i];
							} else {
								output += cw_php.processBasic(buffer);
								buffer = '';
								if(data[i]=='/' && data[i+1]=='*') {
									while(!(data[i]=='*' && data[i+1]=='/') || (i>=data.length)) {
										if(data[i]=='\n') {
											output += cw_basic.frameCode(cw_php.class.comment, buffer);
											output += data[i];
											i++;
											buffer = '';
										}
										if(i<data.length) buffer += data[i];
										i++;
									}
									buffer += data[i];
									i++;
									buffer += data[i];
									output += cw_basic.frameCode(cw_php.class.comment, buffer);
									buffer = '';
								} else if(data[i]=='/' && data[i+1]=='/') {
									while(data[i]!='\n') {
										if(i<data.length) buffer += data[i];
										i++;
									}
									output += cw_basic.frameCode(cw_php.class.comment, buffer);
									output += data[i];
									buffer = '';
								} else if(data[i]=='\'') {
									do {
										if(i<data.length) buffer += data[i];
										i++;
									} while(data[i]!='\'');
									buffer += data[i];
									output += cw_basic.frameCode(cw_php.class.squotes, buffer);
									buffer = '';
								} else if(data[i]=='\"') {
									do {
										if(i<data.length) buffer += data[i];
										i++;
									} while(data[i]!='\"');
									buffer += data[i];
									output += cw_basic.frameCode(cw_php.class.dquotes, buffer);
									buffer = '';
								} else if(data[i]=='&' && data[i+1]=='l' && data[i+2]=='t' && data[i+3]==';' && data[i+4]=='?') {
									buffer = "&lt;?";
									i += 4;
									output += cw_basic.frameCode(cw_php.class.dquotes, buffer);
									buffer = data[i+1] + data[i+2] + data[i+3];
									if(buffer=="php" || buffer=="PHP") {
										output += cw_basic.frameCode(cw_php.class.dquotes, buffer);
										i += 3;
									}
									buffer = '';
								} else if(data[i]=='?' && data[i+1]=='&' && data[i+2]=='g' && data[i+3]=='t' && data[i+4]==';') {
									buffer = "?&gt;";
									i += 4;
									output += cw_basic.frameCode(cw_php.class.dquotes, buffer);
									buffer = '';
								} else {
									output += data[i];
								}
							}
						}
						return output;
	}
}

window.onload = function() {
	cw_php.start();
}