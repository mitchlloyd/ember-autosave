import { AutosaveProxy } from 'ember-autosave';
import { moduleForComponent, test } from 'ember-qunit';
import hbs from 'htmlbars-inline-precompile';

moduleForComponent('ember-observation', {
  integration: true
});

test('AutosaveProxy notifies Ember of property changes', function(assert) {
  let model = { prop: 'value', save() {} };
  this.set('proxy', AutosaveProxy.create({ content: model }));

  this.render(hbs`
    {{input value=proxy.prop}}
    <div id="output">{{proxy.prop}}</div>
  `);

  assert.equal(this.$('#output').text().trim(), 'value', 'precondition - Ember gets the original value');

  this.$('input').val('new').change();

  assert.equal(this.$('#output').text().trim(), 'new', 'Ember was notified of value change');
});
