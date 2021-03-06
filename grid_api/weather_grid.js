var weather_grid = (function() {
  var weather_module = {}

  var data = undefined;
  var max_value = 0;
  var format = "heat";
  var regions = [];

  /**
   * Function to take the data given and store it. Also finds max value overall.
   *
   * @param d The data to be displayed in the graph. Array of Dictionaries where
   * 	    the value to be displayed is tied to the key "data".
   * @param threshold The value to compare the data points and show how close
   * 	    the value is to the max by determing the value of color that needs
   * 	    to be displayed.
   */
  weather_module.load_data = function(d, threshold) {
    data = d
    if (threshold == undefined) {
      for (var i = 0; i < data.length; i++) {
        if (data[i] != undefined && data[i]["count"] > max_value) {
          max_value = data[i]["count"]
        }
      }
    } else {
      max_value = threshold;
    }
  }

  /**
   * Function to define which format to display the grid. If not defined the 
   * grid will just display white.
   *
   * Supported formats:
   * 	- heat
   * 	- cool
   *
   * @param fmt The format to be used. String value
   */
  weather_module.update_format = function(fmt) { console.log(fmt);
    format = fmt
  }

  /**
   * Function to display the grid, the data in the grid, and the 
   * format(if defined). The latitude and longitude expected compbined
   * needs to be the top left corner and it will show the 20 degrees
   * to the right and 20 degrees to the bottom of that point.
   * This function needs to be called each time information is updated.
   *
   * @param canvasTag The string ID value for the canvas tag to have the info
   * 		    displayed in.
   * @param lat The starting latitude, expects top value.
   * @param lon The starting longitude, expects left value.
   */
  weather_module.display = function(canvasTag, lat, lon) {
    lat = parseInt(lat);
    lon = parseInt(lon);
    var c = window.document.getElementById(canvasTag);
    var w_width = window.innerWidth - 300;
    var w_height = window.innerHeight;
    c.width = w_width;
    c.height = w_height;
    c.addEventListener("mousedown", function(event) {
      var event = event || window.event
      var x = new Number();
      var y = new Number();
      if (event.x != undefined && event.y != undefined) {
        x = event.x;
        y = event.y;
      } else {
        x = event.pageX;
        y = event.pageY;
      }
      var canvas = document.getElementById("weather_grid");
      x -= canvas.offsetLeft;
      y -= canvas.offsetTop;

      x += window.pageXOffset;
      y += window.pageYOffset;
      setTile(index_of_region({
        x: x,
        y: y
      }));
    }, false);
    var ctx = c.getContext("2d")
    imageObj = new Image();
    imageObj.onload = function() {
      ctx.drawImage(imageObj, 90, 110, 460, 460, 0, 0, c.width, c.height);
      var boxSize = 80
      var width = c.width;
      var height = c.height;
      var size = width + height
      var box_size = size / boxSize
      var text_pos_y = 0.35 * box_size
      var text_pos_x = 0.8 * box_size
      regions = []
      count = 0
      for (var i = box_size, j = box_size; j <= size / 2; i += box_size) {
        regions.push({
          x_pos: i,
          y_pos: j,
          size: box_size
        });
        ctx.fillStyle = "black";
        ctx.strokeStyle = "black";
        ctx.beginPath();
        ctx.moveTo(i, j);
        ctx.lineTo(i - box_size, j);
        ctx.stroke()
        ctx.moveTo(i, j)
        ctx.lineTo(i, j - box_size)
        ctx.stroke()
        ctx.closePath()
        if (count < data.length) {
          var item = data[count]
          if (item != undefined) {
            fill_square(ctx, item["count"], i, j, box_size)
          }
        }
        if (i >= width) {
          j += box_size
          i = 0
        }
        count++
      }
    }
    // make sure lat wraps around correctly
    lat = lat - 9.0;
    if (lat < -90.0) {
      lat = 90.0 + (90.0 + lat);
    } else if (lat > 90.0) {
      lat = -(90.0 - (lat - 90.0));
    }
    // make sure long wraps around correctly
    lon = lon + 10.0;
    if (lon > 180.0) {
      lon = -(180.0 - (lon - 180.0));
    } else if (lon < -180.0) {
      lon = 180.0 + (180.0 + lon);
    }
    imageObj.src = "https://maps.googleapis.com/maps/api/staticmap?center=" + lat + "," + lon + "&zoom=5&size=" + c.width + "x" + c.height + "&maptype=satellite&key=AIzaSyBiJ3S2EtlwwzNw_p9IjofNx2Hwpc-EGzQ";
  }

  var fill_square = function(ctx, value, i, j, box_size) {
    value = parseInt(value) || 0;
    var num_val = Math.floor((value / max_value) * 255);
    if (num_val > 255) {
      num_val = 255;
    }
    if (format == "heat") {
      var color_str = "rgba(" + num_val + ",0,0," + (num_val / 300) + ")";
      ctx.fillStyle = color_str;
      ctx.fillRect(i - box_size, j - box_size, box_size, box_size)
    } else if (format == "cool") {
      var color_str = "rgba(0,0," + num_val + "," + (num_val / 300) + ")";
      ctx.fillStyle = color_str;
      ctx.fillRect(i - box_size, j - box_size, box_size, box_size)
    }
  }

  var check_region_collision = function(point, region) {
    return (point.x <= region.x_pos && point.y <= region.y_pos && point.x >= (region.x_pos - region.size) && point.y >= (region.y_pos - region.size));
  }

  var index_of_region = function(point) {
    var count = regions.length;
    for (var i = 0; i < count; i++) {
      if (check_region_collision(point, regions[i])) {
        return i;
      }
    }
  }

  return weather_module
})()
