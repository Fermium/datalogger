<block-header>
  <div class='panel-heading'>
    <h5>{title}</h5>
    <div class='heading-elements'>
      <ul class='icons-list'>
         <li if={has_gain} class={gain.classes}>
           <a data-toggle='dropdown' class='dropdown-toggle' >
              Gain
              <i class='caret'></i>
            </a>
            <ul class='dropdown-menu dropdown-menu-left gain'>
              <li each={value in gain.values}>
                <a href='#'>x{value}</a>
              </li>
            </ul>
            <li each={action in actions}>
              <a data-action={action} data-content={action == 'editequation' ? actions[action] : ''}></a>
            </li>
         </li>
      </ul>
    </div>
  </div>
  <script>
    'use strict';
    this.title = 'Ciao';
    this.has_gain = true;
    this.gain = {
      'classes':'dropdown gain-wrap',
      'values' : [
        0.5,
        1.0,
        2.5,
        3.0,
        5.0
      ]
    }
    this.actions={
      'editequation' : 'temp',
      'collapse':'collapse'
    }
    if (this.has_gain){
      $('.gain li a').click(function() {
          var selText = $(this).text();
          $(this).parents('.gain-wrap').find('.dropdown-toggle').html(selText + ' <i class="caret"></i>');
      });
    }
    // Collapse on click
    $('block-header [data-action=collapse]').click(function (e) {
        e.preventDefault();
        var $panelCollapse = $(this).parent().parent().parent().parent().parent().nextAll();
        $(this).parents('.panel').toggleClass('panel-collapsed');
        $(this).toggleClass('rotate-180');

        containerHeight(); // recalculate page height

        $panelCollapse.slideToggle(150);
    });
  </script>
</block-header>
