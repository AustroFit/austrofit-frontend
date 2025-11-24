<script>
  const {item} = $props();
</script>

<div class="faq-question">
  {item.question}
</div>
<div class="faq_answer">
  {@html item.answer}
</div>