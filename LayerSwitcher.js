import "./import-jquery";
import "jquery-ui-dist/jquery-ui.js";

// Create a simple layer switcher in element div:
let LayerSwitcher = function(options){
  var o = this.options = options || {};
  var map = this.map = options.map;
  var mapDiv = o.mapDiv || 'map_canvas'; 
  var cssPath = o.cssPath || 'LayerSwitcher.css';

		// Collapse/Expand
		var layerGroups = $('#layerGroups');
		var layerExpandingTrigger = $('#layerExpandingTrigger');
		var layerCollapsingTrigger = $('#layerCollapsingTrigger');
		
		layerExpandingTrigger.click(function() {
      layerExpandingTrigger.hide();
			layerGroups.show();
			$("#" + mapDiv).focus();
		});
		
		layerCollapsingTrigger.click(function() {
      layerExpandingTrigger.show();			
			layerGroups.hide();
			$("#" + mapDiv).focus();
		});	    
  
  // element to render in:
  var $baseDiv,$overDiv;

  if(o.div_baselayers && o.div_overlays){
    $baseDiv = $('#' + o.div_baselayers);
    $overDiv = $('#' + o.div_overlays);
  }
  
  // load css:
  var cssL = document.createElement('link'); 
  var $cssL = $('<link>'), cssL = $cssL[0];
  cssL.rel = 'stylesheet'; cssL.type = 'text/css'; cssL.href = cssPath;
  $(document.head).append(cssL);
  
  // array with layers:
  var layers = map.getLayers().getArray();
  
  // turn off other baselayers:
  var otherBLoff = function(layer){
    $.each(layers, function(i,l){
      if(l!==layer && l.get('baselayer'))
        { l.setVisible(false); }
    });
  };
  
  // go through each layer, render control and set handlers:
  $.each(layers, function(i,l){
    var BL = l.get('baselayer');
    var classname = BL ? 'baselayers' : 'wmslayers';
    var $li = $('<li class="baselayers"/>').append('<button type="button">' + l.get("name") + '</button>');
    BL ? $baseDiv.append($li) : $overDiv.append($li) ;
    $li.addClass(classname);
    l.getVisible() ? $li.addClass('active') : $li.removeClass('active') ;
    $li.click(function(){ 
      l.setVisible(!l.getVisible());
      l.get('baselayer') ? otherBLoff(l) :0;
    }); //toggle viz on click
    // bind checkbox state to layer event:
    l.on('change:visible', function(e){
      this.getVisible() ? $li.addClass('active') : $li.removeClass('active') ;
    }); // bind
  }); // each

  layerGroups.hide();
  
}; // LayerSwitcher

export {LayerSwitcher}