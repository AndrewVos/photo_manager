module ApplicationHelper
  BOOTSTRAP_FLASH_CLASSES = {
    notice: 'alert alert-info',
    success: 'alert alert-success',
    error: 'alert alert-danger',
    alert: 'alert alert-warning'
  }.with_indifferent_access.freeze

  def flash_class(level)
    BOOTSTRAP_FLASH_CLASSES.fetch(level)
  end
end
