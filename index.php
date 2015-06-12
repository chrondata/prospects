<ul class="nav nav-pills" data-tabs="tabs">
  <li role="presentation" class="active"><a href="#interactive_introduction" data-toggle="tab">Introduction</a></li>
  <li role="presentation"><a href="#interactive_assets" data-toggle="tab">Assets</a></li>
  <li role="presentation"><a href="#interactive_variables" data-toggle="tab">Variables</a></li>
  <li role="presentation"><a href="#interactive_studioproject" data-toggle="tab">Studio Project</a></li>
  <li role="presentation"><a href="#interactive_relatedphotos" data-toggle="tab">Related Photos</a></li>
  <li role="presentation"><a href="#interactive_relateddocuments" data-toggle="tab">Related Documents</a></li>
</ul>
<br>
<div id="my-tab-content" class="tab-content">
    <div class="tab-pane active" id="interactive_introduction">
        <div class="panel panel-default">
            <div class="panel-heading">
                <h3 class="panel-title">Quick Introduction</h3>
            </div>
            <div class="panel-body">
            <p>Use the navigation above to find out more information about how to work with interactive views.</p>
            </div>
        </div>
    </div>
    <div class="tab-pane" id="interactive_assets">
        <div class="panel panel-default">
            <div class="panel-heading">
                <h3 class="panel-title">How to load assets from the asset directories</h3>
            </div>
            <div class="panel-body">
                <dl>
                    <dt>Javascript</dt>
                    <dd>
                        <pre><?php echo htmlentities('<?php echo $theme->asset->js(\'filename.js\'); ?>');?></pre>
                    </dd>
                    <dt>Cascading Style Sheets</dt>
                    <dd>
                        <pre><?php echo htmlentities('<?php echo $theme->asset->css(\'filename.css\'); ?>');?></pre>
                    </dd>
                    <dt>Images</dt>
                    <dd>
                        <pre><?php echo htmlentities('<?php echo $theme->asset->img(\'filename.jpg\'); ?>');?></pre>
                    </dd>
                </dd>
            </div>
        </div>
    </div>
    <div class="tab-pane" id="interactive_variables">
        <?php foreach ($interactive->properties() as $variable_name): ?>
        <div class="panel panel-default">
          <div class="panel-heading">
            <h3 class="panel-title">Variable: <?php echo $variable_name['name'];?></h3>
          </div>
          <div class="panel-body">
            <div class="panel panel-default">
                <div class="panel-heading">
                    <h3 class="panel-title">Value</h3>
                </div>
                <div class="panel-body">
                    <?php echo ((call_user_func_array(array($interactive,'get_'.$variable_name['name']), array())) ?: '[empty]'); ?>
                </div>
                <div class="panel-heading">
                    <h3 class="panel-title">Code</h3>
                </div>
                <div class="panel-body">
                    <dl>
                        <dt>Get the raw value: </dt>
                        <dd>
                            <pre><?php echo htmlentities('<?php echo $interactive->get_'.$variable_name['name'].'(); ?>');?></pre>
                        </dd>
                        <dt>Get the value with html entities encoded: </dt>
                        <dd>
                            <pre><?php echo htmlentities('<?php echo htmlentities($interactive->get_'.$variable_name['name'].'()); ?>');?></pre>
                        </dd>
                    </dl>
                </div>
              </div>
          </div>
        </div>
        <?php endforeach;?>
    </div>
    <div class="tab-pane" id="interactive_studioproject">
        <div class="panel panel-default">
            <div class="panel-heading">
                <h3 class="panel-title">Available Studio Projects</h3>
            </div>
            <div class="panel-body">
            <p>TODO</p>
            </div>
        </div>
    </div>
    <div class="tab-pane" id="interactive_relatedphotos">
        <div class="panel panel-default">
            <div class="panel-heading">
                <h3 class="panel-title">Available Related Photos</h3>
            </div>
            <div class="panel-body">
            <p>TODO</p>
            </div>
        </div>
    </div>
    <div class="tab-pane" id="interactive_relateddocuments">
        <div class="panel panel-default">
            <div class="panel-heading">
                <h3 class="panel-title">Available Related Documents</h3>
            </div>
            <div class="panel-body">
            <p>TODO</p>
            </div>
        </div>
    </div>
</div>