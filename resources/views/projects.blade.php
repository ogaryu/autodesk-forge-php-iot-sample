@if (count($projects) > 0)
    <table class="table table-striped">
        <tbody>
        @foreach ($projects as $project)
            <tr>
                <td class="table-text"><div>{{ $project['attributes']['name'] }}</div></td>

                <td class="table-btn">
                    <form action="/items/{{ $project['id'] }}/{{ $project['relationships']['rootFolder']['data']['id'] }}" method="GET" data-request-type="items" class="ajaxform">
                        {{ csrf_field() }}
                        <button type="submit" class="btn btn-primary">
                            <i class="fa fa-folder-open"></i>Items
                        </button>
                    </form>
                </td>
            </tr>
        @endforeach
        </tbody>
    </table>
@endif