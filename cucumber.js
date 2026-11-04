module.exports = {
  default: {
    require: ['features/support/**/*.js', 'features/step_definitions/**/*.js'],
    format: ['progress', 'html:relatorios/cucumber-report.html'],
    publish: false
  }
}
