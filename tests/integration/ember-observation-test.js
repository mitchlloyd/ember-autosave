import { AutosaveProxy } from 'ember-autosave';
import { moduleForComponent, test } from 'ember-qunit';
import Ember from 'ember';
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

test("Framework Test - Ember set doesn't notify listeners when new value === the previous one", function(assert) {
  let renders = 0;
  const countRenders = () => ++renders;
  this.register('helper:count-renders', Ember.Helper.helper(countRenders));

  this.set('model', { prop: 1 });

  this.render(hbs`
    {{count-renders}}
    <div id="output">{{model.prop}}</div>
  `);

  assert.equal(this.$('#output').text().trim(), '1', 'precondition - Ember gets the original value');
  assert.equal(renders, 1, 'rendered once');

  Ember.set(this.model, 'prop', 1);
  assert.equal(this.$('#output').text().trim(), '1', 'New value is the same');
  assert.equal(renders, 1, 'did not rerender');
});

test("AutosaveProxy doesn't notify listeners when value === the previous value", function(assert) {
  let renders = 0;
  const countRenders = () => ++renders;
  this.register('helper:count-renders', Ember.Helper.helper(countRenders));

  let model = { prop: 1 };
  this.set('proxy', AutosaveProxy.create({ content: model }));

  this.render(hbs`
    {{count-renders}}
    <div id="output">{{proxy.prop}}</div>
  `);

  assert.equal(this.$('#output').text().trim(), '1', 'precondition - Ember gets the original value');
  assert.equal(renders, 1, 'rendered once');

  Ember.set(this.proxy, 'prop', 1);
  assert.equal(this.$('#output').text().trim(), '1', 'New value is the same');
  assert.equal(renders, 1, 'did not rerender');
});
