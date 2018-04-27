function styleSetup(){
  // $(function () {
  //    $( '#contextCollapse' ).collapse()
  // });
  $("#argoBrand")
  .effect("shake", {
    direction: "up",
    distance: 5,
    times: 3
  }, 1000)
  .animate({
    color: "#CECECE"
    },
    1000
  )
}

function slider_setup() {
    $( "#time_slider" ).slider();
  };

function main() {
  styleSetup()
  slider_setup()
}
