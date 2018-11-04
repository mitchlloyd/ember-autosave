import { set } from '@ember/object';
import { helper as buildHelper } from '@ember/component/helper';
import { fillIn, find } from '@ember/test-helpers';
import { AutosaveProxy } from 'ember-autosave';
import { setupRenderingTest, module, test } from 'ember-qunit';
import hbs from 'htmlbars-inline-precompile';

module('ember-observation', function(hooks) {
  setupRenderingTest(hooks);

  test('AutosaveProxy notifies Ember of property changes', async function(assert) {
    let model = { prop: 'value', save() {} };
    this.set('proxy', AutosaveProxy.create(model));

    await this.render(hbs`
      {{input value=proxy.prop}}
      <div id="output">{{proxy.prop}}</div>
    `);

    assert.equal(find('#output').textContent.trim(), 'value', 'precondition - Ember gets the original value');
    await fillIn('input', 'new');
    assert.equal(find('#output').textContent.trim(), 'new', 'Ember was notified of value change');
  });

  test("Framework Test - Ember set doesn't notify listeners when new value === the previous one", async function(assert) {
    let renders = 0;
    const countRenders = () => ++renders;
    this.owner.register('helper:count-renders', buildHelper(countRenders));

    this.set('model', { prop: 1 });

    await this.render(hbs`
      {{count-renders}}
      <div id="output">{{model.prop}}</div>
    `);

    assert.equal(find('#output').textContent.trim(), '1', 'precondition - Ember gets the original value');
    assert.equal(renders, 1, 'rendered once');

    set(this.model, 'prop', 1);
    assert.equal(find('#output').textContent.trim(), '1', 'New value is the same');
    assert.equal(renders, 1, 'did not rerender');
  });

  test("AutosaveProxy doesn't notify listeners when value === the previous value", async function(assert) {
    let renders = 0;
    const countRenders = () => ++renders;
    this.owner.register('helper:count-renders', buildHelper(countRenders));

    let model = { prop: 1 };
    this.set('proxy', AutosaveProxy.create(model));

    await this.render(hbs`
      {{count-renders}}
      <div id="output">{{proxy.prop}}</div>
    `);

    assert.equal(find('#output').textContent.trim(), '1', 'precondition - Ember gets the original value');
    assert.equal(renders, 1, 'rendered once');

    set(this.proxy, 'prop', 1);
    assert.equal(find('#output').textContent.trim(), '1', 'New value is the same');
    assert.equal(renders, 1, 'did not rerender');
  });
});
