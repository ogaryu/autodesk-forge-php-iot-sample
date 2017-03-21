@if (count($issues) > 0)
    <table class="table table-striped issues-table">
        <thead>
        <th>Viewer</th>
        <th>Id</th>
        <th>Description</th>
        <th>Priority</th>
        <th>Status</th>
        <th>Due date</th>
        <th>Author</th>
        <th>Date Created</th>
        </thead>
        <tbody>
        @foreach ($issues as $issue)
            <tr>
                @for($i=0; $i < count($issue['fields']); $i++)
                    @if($issue['fields'][$i]['name'] == 'Identifier')
                        <td class="table-text col-sm-1">
                            <form action="/viewer/{{ $issue['fields'][$i]['value'] }}" method="POST" class="ajaxform">
                                {{ csrf_field() }}
                                <button type="submit" class="btn btn-primary">
                                    <i class="fa fa-tasks"></i>Viewer
                                </button>
                            </form>
                        </td>
                    @endif
                @endfor

                @for($i=0; $i < count($issue['fields']); $i++)
                    @if($issue['fields'][$i]['name'] == 'Identifier')
                        <td class="table-text col-sm-1"><div>{{ $issue['fields'][$i]['value'] }}</div></td>
                    @endif
                @endfor

                @for($i=0; $i < count($issue['fields']); $i++)
                    @if($issue['fields'][$i]['name'] == 'Description')
                        <td class="table-text col-sm-4"><div>{{ $issue['fields'][$i]['value'] }}</div></td>
                    @endif
                @endfor

                @for($i=0; $i < count($issue['fields']); $i++)
                    @if($issue['fields'][$i]['name'] == 'Priority')
                        <td class="table-text col-sm-1"><div>{{ $issue['fields'][$i]['value'] }}</div></td>
                    @endif
                @endfor

                @for($i=0; $i < count($issue['fields']); $i++)
                    @if($issue['fields'][$i]['name'] == 'Status')
                        <td class="table-text col-sm-1"><div>{{ $issue['fields'][$i]['value'] }}</div></td>
                    @endif
                @endfor

                @for($i=0; $i < count($issue['fields']); $i++)
                    @if($issue['fields'][$i]['name'] == 'Due date')
                        <td class="table-text col-sm-1"><div>{{ $issue['fields'][$i]['value'] }}</div></td>
                    @endif
                @endfor

                <td class="table-text col-sm-2"><div>{{ $issue['created_by'] }}</div></td>

                <td class="table-text col-sm-2"><div>{{ $issue['created_at'] }}</div></td>

            </tr>
        @endforeach
        </tbody>
    </table>
@endif