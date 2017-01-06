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
              <a data-action={action}></a>
            </li>
         </li>
      </ul>
    </div>
  </div>
  <script>
    'use strict';
    this.title = '';
    this.has_gain = false;
    this.gain = {
      'classes':'a b c d',
      'values' : [
        0.5,
        1.0,
        2.5,
        3.0,
        5.0
      ]
    }
    if (his.has_gain){
      $('.gain li a').click(function() {
          var selText = $(this).text();
          $(this).parents('.gain-wrap').find('.dropdown-toggle').html(selText + ' <i class="caret"></i>');
      });
    }
  </script>
</block-header>
