
jQuery(document).ready(function() {
	

	$('.dismiss, .overlay').on('click', function() {
        $('.sidebar').removeClass('active');
    
       
        
    });

    $('.open-menu').on('click', function(e) {
    	e.preventDefault();
        $('.sidebar').addClass('active');
      
        // close opened sub-menus
        $('.collapse.show').toggleClass('show');
        $('a[aria-expanded=true]').attr('aria-expanded', 'false');
    
    });
  
	
	
});
