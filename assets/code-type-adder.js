$('div.highlight').each(function () {
  var $el = $(this)
    , type = $el.find('code')[0].className
    , $aside = $('<aside>' + type + '</aside>')
  $el.append($aside);
})