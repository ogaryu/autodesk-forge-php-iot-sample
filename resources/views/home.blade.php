@extends('layouts.app')

@section('content')
    <div class="main-container container">
        <div class="col-sm-3 devided-container">
            <div class="panel panel-default">
                <div class="panel-heading">
                    <h3 class="panel-title pull-left">
                        Hubs
                    </h3>
                    <form action="/hub" method="GET" class="form-horizontal ajaxform" id="hubform" data-request-type="hub">
                        {{ csrf_field() }}
                        <button type="submit" class="btn btn-default pull-right header-right-btn">
                            <i class="fa fa-cloud"></i>Get Hub
                        </button>
                    </form>
                    <div class="clearfix"></div>
                </div>
                <div class="panel-body panel-body-left" id="hub-body">
                    
                </div>
            </div>

            <div class="panel panel-default">
                <div class="panel-heading">
                    <h3 class="panel-title pull-left">
                        Projects
                    </h3>
                    <div class="clearfix"></div>
                </div>
                <div class="panel-body panel-body-left" id="projects-body">
                </div>
            </div>

            <div class="panel panel-default">
                <div class="panel-heading">
                    <h3 class="panel-title pull-left">
                        Items
                    </h3>
                    <button type="button" class="btn btn-default pull-right header-right-btn"  data-toggle="modal" data-target="#itemModal">
                        <i class="fa fa-cloud-upload"></i>Upload
                    </button>
                    <div class="clearfix"></div>
                </div>
                <div class="panel-body panel-body-left" id="items-body">
                </div>
            </div>

            <div class="panel panel-default">
                <div class="panel-heading">
                    <h3 class="panel-title pull-left">
                        SubItems
                    </h3>
                    <div class="clearfix"></div>
                </div>
                <div class="panel-body panel-body-left" id="subitems-body">
                    <table class="table table-striped">
                        <tbody>
                        </tbody>
                    </table>
                </div>
            </div>

            <div class="panel panel-default">
                <div class="panel-heading">
                    <h3 class="panel-title pull-left">
                        Issues
                    </h3>
                    <button type="button" class="btn btn-default pull-right header-right-btn" data-toggle="modal" data-target="#issueModal">
                        <i class="fa fa-plus-square"></i>New Issue
                    </button>
                    <div class="clearfix"></div>
                </div>
                <div class="panel-body issues-panel-body panel-body-left" id="issues-body">
                </div>
            </div>

            <div class="panel panel-default">
                <div class="panel-heading">
                    <h3 class="panel-title pull-left">
                        Sensors
                    </h3>
                    <button type="button" class="btn btn-default pull-right header-right-btn" id="pusher-subscribe">
                        <i class="fa fa-heart"></i>Subscribe
                    </button>
                    <div class="clearfix"></div>
                </div>
                <div class="panel-body panel-body-left">
                    @if (count($sensors) > 0)
                        <table class="table table-striped">
                            <tbody id="sensor-device">
                            @foreach ($sensors as $sensor)
                            <tr>
                            <td class="table-text"><div>{{ $sensor['name'] }}</div></td>
                            
                            <td>
                            <div>{{ $sensor['value'] }}</div>
                            </td>
                            </tr>
                            @endforeach
                            </tbody>
                        </table>
                    @endif
                </div>
            </div>

        </div>
        
        <div class="col-sm-9 devided-container container-right">
            <!-- Display Validation Errors -->
            @include('common.errors')
            <div class="panel panel-default">
                <div class="panel-body">
                    <div id="viewer-body"></div>
                    <div id="viewer" style="position: relative; width: 100%; height: 630px; border: 1px solid #ddd;"></div>
                </div>
            </div>
            <div class="panel panel-default">
                <div class="panel-body">
                    <div id="information-panel">
                    </div>
                </div>
            </div>
        </div>
    </div>
@endsection

@section('issue-modal')
    <div class="modal fade" tabindex="-1" role="dialog" id="issueModal">
        <div class="modal-dialog">
            <div class="modal-content">
                <div class="modal-header">
                    <button type="button" class="close" data-dismiss="modal" aria-label="Close"><span aria-hidden="true">&times;</span></button>
                    <h4 class="modal-title">Create Issue</h4>
                </div>
                <div class="modal-body">
                    <form action="/issue" method="POST" class="form-horizontal ajaxform">
                        {{ csrf_field() }}
                        <div class="form-group">
                            <label for="issue-description" class="col-sm-3 control-label">Description</label>

                            <div class="col-sm-6">
                                <input type="text" name="description" id="issue-description" class="form-control">
                            </div>
                        </div>
                        <div class="form-group">
                            <label for="issue-priority" class="col-sm-3 control-label">Priority</label>
                            <div class="dropdown col-sm-6">
                                <button class="btn btn-default dropdown-toggle" type="button" data-toggle="dropdown">
                                    Priority
                                    <span class="caret"></span>
                                </button>
                                <ul class="dropdown-menu">
                                    <li><a href="#" data-value="Low">Low</a></li>
                                    <li><a href="#" data-value="Medium">Medium</a></li>
                                    <li><a href="#" data-value="High">High</a></li>
                                    <li><a href="#" data-value="Critical">Critical</a></li>
                                </ul>
                                <input type="hidden" name="priority" id="issue-priority" value="">
                            </div>
                        </div>
                        <div class="form-group">
                            <label for="issue-status" class="col-sm-3 control-label">Status</label>
                            <div class="dropdown col-sm-6">
                                <button class="btn btn-default dropdown-toggle" type="button" data-toggle="dropdown">
                                    Status
                                    <span class="caret"></span>
                                </button>
                                <ul class="dropdown-menu">
                                    <li><a href="#" data-value="Draft">Draft</a></li>
                                    <li><a href="#" data-value="Open">Open</a></li>
                                    <li><a href="#" data-value="Work Completed">Work Completed</a></li>
                                    <li><a href="#" data-value="Ready to Inspect">Ready to Inspect</a></li>
                                    <li><a href="#" data-value="Not Approved">Not Approved</a></li>
                                    <li><a href="#" data-value="Closed">Closed</a></li>
                                </ul>
                                <input type="hidden" name="status" id="issue-status" value="">
                            </div>
                        </div>
                        <div class="form-group">
                            <label for="issue-duedate" class="col-sm-3 control-label">Due Date</label>

                            <div class="col-sm-6">
                                <input type="date" name="duedate" id="issue-duedate" class="form-control">
                            </div>
                        </div>
                        <div class="form-group">
                            <div class="col-sm-offset-3 col-sm-6">
                                <button type="submit" class="btn btn-default">
                                    Create
                                </button>
                            </div>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    </div>

    {{--<div class="modal fade" tabindex="-1" role="dialog" id="viewerModal">--}}
        {{--<div class="modal-dialog">--}}
            {{--<div class="modal-content">--}}
                {{--<div class="modal-header">--}}
                    {{--<button type="button" class="close" data-dismiss="modal" aria-label="Close"><span aria-hidden="true">&times;</span></button>--}}
                    {{--<h4 class="modal-title">Issue Viewer</h4>--}}
                {{--</div>--}}
                {{--<div class="modal-body">--}}
                    {{----}}
                {{--</div>--}}
            {{--</div>--}}
        {{--</div>--}}
    {{--</div>--}}
@endsection