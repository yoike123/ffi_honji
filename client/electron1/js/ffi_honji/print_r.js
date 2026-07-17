/**
 * PHP-like print_r() & var_dump() equivalent for JavaScript Object
 *
 * @author Faisalman <movedpixel@gmail.com>
 * @license http://www.opensource.org/licenses/mit-license.php
 * @link http://gist.github.com/879208
 * @require type.of()
 */
var print_r = function(obj,t){
	var isArray = type.of(obj)==='array';
	var tab = t || '';
	var dump = isArray ? 'Array\n'+tab+'[\n' : 'Object\n'+tab+'{\n';
	for(var i in obj){
		if (obj.hasOwnProperty(i)) {
			var param = obj[i];
			var val = '';
			var paramType = type.of(param);
			switch(paramType){
				case 'array':
				case 'object':
					val = print_r(param,tab+'\t');
					break;
				case 'boolean':
					val = param ? 'true' : 'false';
					break;
				case 'string':
					val = '\''+param+'\'';
					break;
				default:
					val = param;
			}
			dump += tab+'\t'+i+' => '+val+',\n';
		}
	}
	dump = dump.substring(0, dump.length-2)+'\n'+tab;
	return isArray ?  dump+']' : dump+'}';
};
var var_dump = print_r;


/**
 * type.of() – a more specific typeof()
 * by Rolando Garza
 * 
 * http://rolandog.com/archives/2007/01/18/typeof-a-more-specific-typeof/
 * http://snipplr.com/view/1996
 */
var is={
        Null:function(a){
                return a===null;
        },
        Undefined:function(a){
                return a===undefined;
        },
        nt:function(a){
                return(a===null||a===undefined);
        },
        Function:function(a){
                return(typeof(a)==='function')?a.constructor.toString().match(/Function/)!==null:false;
        },
        String:function(a){
                return(typeof(a)==='string')?true:(typeof(a)==='object')?a.constructor.toString().match(/string/i)!==null:false;
        },
        Array:function(a){
                return(typeof(a)==='object')?a.constructor.toString().match(/array/i)!==null||a.length!==undefined:false;
        },
        Boolean:function(a){
                return(typeof(a)==='boolean')?true:(typeof(a)==='object')?a.constructor.toString().match(/boolean/i)!==null:false;
        },
        Date:function(a){
                return(typeof(a)==='date')?true:(typeof(a)==='object')?a.constructor.toString().match(/date/i)!==null:false;
        },
        HTML:function(a){
                return(typeof(a)==='object')?a.constructor.toString().match(/html/i)!==null:false;
        },
        Number:function(a){
                return(typeof(a)==='number')?true:(typeof(a)==='object')?a.constructor.toString().match(/Number/)!==null:false;
        },
        Object:function(a){
                return(typeof(a)==='object')?a.constructor.toString().match(/object/i)!==null:false;
        },
        RegExp:function(a){
                return(typeof(a)==='function')?a.constructor.toString().match(/regexp/i)!==null:false;
        }
};
var type={
        of:function(a){
                for(var i in is){
                        if(is[i](a)){
                                return i.toLowerCase();
                        }
                }
        }
};


